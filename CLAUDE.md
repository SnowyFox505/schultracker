# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Schultracker — a German-language React PWA for a German student (built by/for "Leopold N.", see `Developer: Leopold N.` footer in `Settings.jsx`): Stundenplan (schedule), Hausaufgaben (homework), Prüfungen/Tests, and Notizen (notes). Firebase (Auth + Firestore) backend, deployed to Vercel. The user is non-technical, German-speaking, and uses the app almost exclusively as an **installed home-screen PWA on iPhone via Safari** (this matters a lot — see the mobile section below). They sometimes watch Claude work live in the Browser pane rather than reading screenshots.

**Live URL:** https://schultracker.vercel.app

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # production build
npm run lint      # oxlint
npm run preview   # preview a production build locally
```

No automated test suite exists in this repo. Verification is manual (see "How this project gets tested" below).

**Deploy:** `npx vercel --prod --yes` from the repo root deploys the frontend to the linked Vercel project (aliases to schultracker.vercel.app). There is no `firebase.json`/`.firebaserc` in this repo, so **`firestore.rules` is never deployed by this command** — after editing it, the new rules must be pasted into the Firebase Console (Firestore → Rules) by hand, or the deployed frontend silently runs against stale rules.

## Architecture

**Stack:** Vite + React 19 + React Router v7 (client-side, `BrowserRouter`) + Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` tokens in `src/index.css`, no `tailwind.config.js`) + Framer Motion for essentially all animation + Firebase (`src/lib/firebase.js`, config from `VITE_FIREBASE_*` env vars, set in Vercel project settings) + `vite-plugin-pwa` (`registerType: 'autoUpdate'`, manifest in `vite.config.js`).

### Routing & auth gating (`src/App.jsx`, `src/components/ProtectedRoute.jsx`)

Three route guards wrap different parts of the tree:
- `PublicOnlyRoute` — `/login`, `/signup`; redirects away if already authenticated (to `/onboarding` or `/` depending on `profile.onboardingComplete`).
- `OnboardingRoute` — `/onboarding`; redirects to `/` once onboarding is done.
- `ProtectedRoute` — everything else, wraps `AppLayout`; redirects to `/login` or `/onboarding` as needed.

`AuthContext` (`src/context/AuthContext.jsx`) exposes `user` (Firebase Auth) and `profile` (live `onSnapshot` on `users/{uid}`) separately — most gating logic checks `profile.onboardingComplete`, not just `user`. Auth methods: email/password and Google popup (`loginWithGoogle`). `completeOnboarding` sets `justOnboarded` state *before* the Firestore write, specifically to win a race against the `OnboardingRoute` redirect — don't reorder that.

Logout is confirm-gated: there are two logout entry points (Settings page, desktop `SideNav`'s bottom link), and both call `requestLogout()` rather than `logout()` directly. `AuthContext`'s `logoutFlow` state (`'idle' | 'confirm' | 'running'`) drives a confirmation `Sheet` and then the `LoggingOutOverlay` big-moment animation, rendered once in `AppLayout.jsx` so both entry points share the same flow — `logout()` itself (the actual `signOut`) is only called as the overlay's `onDone`. Add any future logout trigger through `requestLogout()`, not `logout()`, to keep the confirmation in place.

### Data model (Firestore)

Everything currently lives under `users/{uid}/...` — fully siloed per user, no cross-user sharing yet.

- `users/{uid}` — profile doc: `name`, `email`, `onboardingComplete`, `subjects` (`[{id, name, color}]`), `customColors`, `hiddenColors`, `colorTheme`.
- `users/{uid}/schedule/{day-period}` — one doc per lesson slot, id is literally `"${day}-${period}"` (e.g. `"Mo-3"`). Managed by `src/lib/useSchedule.js` (not the generic hook below — it's a map keyed by slot id, not a list).
- `users/{uid}/breaks/{afterPeriod}` — one doc per gap between two periods (doc id is the period number the break comes *after*, e.g. `"2"` = the break between period 2 and 3), applies to every weekday that has that period — not tied to a single day/cell like `schedule` is. Fields: `afterPeriod`, `duration` (minutes). Managed by `src/lib/useBreaks.js`. Rendered in `Stundenplan.jsx` as a full-width row (`col-span-6`) between the corresponding period rows, editable only in edit mode via its own small Sheet (separate from the per-cell lesson Sheet).
- `users/{uid}/homework`, `users/{uid}/tests`, `users/{uid}/notes` — generic list collections, all read/written through `src/lib/useCollection.js` (`useCollection(name, {order, direction})` → `{items, add, update, remove}`). Homework and note docs may carry a `sketch` field instead of/alongside `title`/`text` — see `src/components/SketchPad.jsx`: handwritten entries store strokes as an array of `{points}` objects (never a raw array of arrays — Firestore rejects directly nested arrays), converted at the read/write edges via the shared `strokesToFirestore`/`strokesFromFirestore` helpers (exported from `SketchPad.jsx`, used by both `Hausaufgaben.jsx` and `Notizen.jsx`). Points are normalized to 0..1 so a stroke renders correctly at any canvas size.

`SketchPad`'s pointer handling has a real-device-driven design: it tracks one in-progress stroke **per `pointerId`** (a `Map`, not shared state), because with a single shared "current stroke" a resting palm and the Apple Pencil touching at the same time made drawing feel completely random (palm and pencil pointer events interleave and clobber each other). It first tried heuristic palm rejection (only reject touch while a pen is actively down, via the Pointer Events API's `pointerType` — `'pen'` vs `'touch'` vs `'mouse'`, the standard way a web page tells Apple Pencil apart from a finger on iPadOS Safari), but the user found it still unreliable on a real iPad. It's now pencil-only instead: any `pointerType === 'touch'` is ignored outright the moment the pad is in "Stift" mode — only `'pen'` and `'mouse'` (desktop) draw — trading away finger-drawing entirely for reliability, per explicit user instruction ("im schlimmsten Fall mach die Handerkennung ganz weg"). The mode toggle button itself still shows the ✍️ emoji but is labeled "Stift", not "Handschrift", to set that expectation. A bounded undo (`MAX_UNDO = 6` in `SketchPad.jsx`) removes the most recent stroke; the counter resets whenever the pad's `value` prop changes (i.e. each time the Sheet opens fresh) and simply stops working once exhausted, by design — it doesn't need to reach further back than the last few strokes.

`firestore.rules` enforces `request.auth.uid == userId` on the whole `users/{userId}` subtree — any new subcollection or cross-user feature needs its own rule block (see the "Bubble" plan below).

Subject colors are resolved via `colorFor(colorId, customColors)` in `src/lib/constants.js` (`SUBJECT_COLORS` are the built-ins; `customColors` come from the user's profile) — always pass the user's `customColors` alongside, since users can add their own via `ColorPicker`.

Account deletion (`src/lib/deleteAccount.js`) hardcodes the list of subcollections to wipe (`SUBCOLLECTIONS = ['schedule', 'homework', 'tests', 'notes']`) — keep it in sync when adding a new per-user collection.

### Layout shell (`src/components/AppLayout.jsx`)

Mobile: a flex column filling `h-[var(--app-height,100dvh)]`, with `BottomNav` docked as a normal (non-`fixed`) flow element after a scrollable content region. Desktop (`md:`): `SideNav` + normal-flow content, no height constraint.

This exact structure is the end result of a long real-device debugging saga — **do not casually change it back** without re-testing on a real iPhone (Chrome DevTools emulation does not reproduce any of these bugs):

1. `position: fixed; bottom: 0` on the bottom nav, combined with `min-h-screen`/`min-h-dvh` on the page, reliably left a large phantom empty gap below the nav in real Mobile Safari — both in a normal tab *and* installed-to-home-screen standalone mode. Not caused by browser chrome (verified: in a plain Safari tab, Safari's own floating toolbar merely overlaps part of the same gap, it doesn't create it).
2. Root cause, found after several failed attempts (bumping to `dvh`, moving `overflow-x: hidden` from `html,body` to `#root`, switching the nav to a non-`fixed` flex-docked element, measuring height via JS): **`#root { overflow-x: hidden }` without an explicit `overflow-y` silently turns `overflow-y` into `auto` per the CSS2.1 spec** ("if overflow-x is not visible and overflow-y is visible, overflow-y computes to auto"). That quietly made `#root` its own independent scroll container with its own broken height resolution on this specific iOS/WebKit standalone path.
3. Fix: never set `overflow-x: hidden` on `html`, `body`, or `#root`. If you need to stop a specific horizontal scroll leak (e.g. the Stundenplan grid dragging the whole page sideways), scope it with `overscroll-behavior-x: contain` on that one scrollable element instead (see `src/pages/Stundenplan.jsx`) — it's the purpose-built property for exactly this, with no page-wide side effects.
4. `--app-height` is set from `window.innerHeight` in `main.jsx` (kept in sync via `resize`/`orientationchange`/`visualViewport` listeners) and used instead of bare `100dvh` on the mobile shell, because plain `dvh` was observed to under-report on this device/WebKit combination even after the `overflow-x` fix.
5. The bottom nav itself is a normal flow element (not `fixed`) specifically so it can never again be silently mispositioned relative to "the real viewport bottom" — it just sits at the end of the flex column.

Related, separate fix: fixed-position elements that *are* still `position: fixed` (the Settings gear icon, `Sheet`, `Fab`) offset themselves with `top-[calc(env(safe-area-inset-top)+1.25rem)]`-style arbitrary Tailwind values rather than a padding-based `.safe-top`/`.safe-bottom` class — padding can't reposition a fixed-size fixed element past the notch/Dynamic Island, only an actual position offset can. (`.safe-top`/`.safe-bottom` in `src/index.css` are still fine to use as padding on normal-flow content, e.g. the main content wrapper.)

Related, separate fix: the Stundenplan grid cells (inside a horizontally-scrollable `overflow-x-auto` container) need explicit `touch-action: pan-x` (container) and `touch-manipulation` (cells), or real-device taps intermittently get swallowed as scroll gestures instead of registering as clicks — this does not reproduce in any desktop browser or emulator, only on a real touchscreen.

### Shared UI conventions

- `PageTransition` wraps each route's content for the fade/slide-in transition; pages compose it plus their own `Fab`/`Sheet`/toast as siblings (see any page in `src/pages/`).
- `Sheet` is the bottom-sheet modal used for all "add X" forms. Besides tapping the backdrop, it can also be dismissed by dragging its top grab handle down (Framer Motion `dragControls` scoped to just that handle strip via `dragListener={false}` + `onPointerDown` → `dragControls.start(e)`, not the whole sheet, so it doesn't fight with scrolling or drawing inside the form) — closes past ~120px of drag or with enough release velocity, otherwise snaps back (`dragSnapToOrigin`).
- `useSavedToast()` (`src/lib/useSavedToast.js`) + `<SavedToast />` is the standard "✓ gespeichert" confirmation after a write; call `trigger()` right after the Firestore write resolves. Used in Stundenplan/Hausaufgaben/Pruefungen/Notizen.
- `SwipeToDelete` wraps list rows (Hausaufgaben/Tests/Notizen) to add a left-swipe-to-delete affordance behind the existing tap-to-delete X button (kept for accessibility/desktop). Uses Framer Motion `drag="x"` with a red trash-icon background revealed underneath.
- `EmptyState` is the standard "nothing here yet" placeholder (breathing dot + text) — used instead of a bare `<p>` for empty lists; `Home.jsx`'s `EmptyNote` is a compact variant of the same idea inside a `Card`.
- Two distinct animation tiers by design — match the right one when adding a new animation:
  - **Big moments** (multi-second, staggered, particle-heavy, full-screen): `IntroReveal` (post-onboarding welcome, ~6s), the pre-onboarding intro sequence inside `Onboarding.jsx` (`OnboardingIntro`, ~9.5s — letter-stagger wordmark → subtitle → 4 app-section icons popping in with labels → floating spark particles), `DeletingOverlay` (account deletion: ~2.5s slow particle implosion → explosion burst + flash ring → indefinitely-looping pulse so it never looks "stuck" while the real async delete is still in flight, capped by a matching `beforeAuthDelete` delay in `Settings.jsx`), `LoggingOutOverlay` (logout: ~6s waving-hand burst + gradient glow + progress bar, accent-colored not red).
  - **Small in-app feedback** (sub-second, everyday interactions): homework checkbox draws its checkmark in via `pathLength` + a spring pop; `BottomNav` icons pop with a small spring bounce when their tab becomes active (`key={isActive}` remount trick, not a continuously-replaying `animate`); Stundenplan cells animate their `background` color and pop the subject text in/out via `animate`/`AnimatePresence` instead of updating instantly; new Notizen cards drop in with a slight rotation ("placing a note down" feel) instead of a plain scale-fade; Tests due "Heute"/"Morgen" get a subtly pulsing badge.

### How this project gets tested

There's no automated test suite. Every feature/fix in this project so far has been verified by:
1. Running `npm run dev`, using the Browser tool (`mcp__Claude_Browser__*`) resized to a real mobile width (320/375/390px tested specifically — 320 = iPhone SE worst case).
2. Creating a throwaway test account (pattern used throughout: `claude-mobile-testN@ik.me` / password `testpass123`, incrementing N) to exercise signup → onboarding → the feature → account deletion.
3. **Always deleting the test account afterward** via the real in-app Settings → "Account löschen" flow (not just abandoning it) — this was an explicit standing instruction from the user.
4. Deploying to production (`npx vercel --prod --yes`) and re-verifying on the live URL before considering a mobile/Safari-specific fix confirmed — the local dev server has its own HMR-only quirks (e.g. a Framer Motion element observed stuck at `opacity: 0` only under Vite dev/HMR, never in a production build) that can produce false positives/negatives unrelated to the actual bug.
5. For anything Safari/iOS-standalone-specific: Chrome DevTools device emulation reliably fails to reproduce the real bug (see the layout-shell section above) — treat an emulator-clean result as inconclusive, not as confirmation, and be ready to ask the user to test on their actual phone and describe/screen-record what they see.

## Planned but not yet built: "Bubble" (shared homework)

A friend of the user's suggested a feature to share homework between 2–3 people so only one person has to enter it. The user wants it named exactly **"Bubble"** (you "join someone's Bubble" via a code). A full implementation plan exists at `C:\Users\neuba\.claude\plans\synchronous-waddling-cloud.md` (may or may not still be present depending on plan-file retention) covering:

- New top-level `bubbles/{code}` collection (doc ID *is* the 6-char join code), `bubbles/{code}/homework/{docId}` subcollection, a new `firestore.rules` block, `src/lib/bubble.js` (create/join/leave), a new `src/lib/useHomework.js` hook that merges personal + bubble homework, and Settings UI to create/join/leave.
- Scope explicitly agreed with the user: homework only (not schedule/tests/notes) for v1; only *new* entries after joining are shared (existing private homework stays private, no migration prompt yet); max 3 members per bubble; each shared item shows a small "von {name}" attribution tag.
- Explicitly deferred: migrating pre-existing homework into a bubble, cleanly removing your own uid from `members` on leave, cleaning up bubble membership on account deletion.

If this plan file is gone, re-derive the design from this section plus the data-model conventions above before implementing — don't skip re-confirming scope with the user, since "which collections get shared" and "what happens to existing data" were deliberate product decisions, not technical defaults.

**Later extension ideas for Bubble** (not in the v1 scope above, collected in `TODO.md` under 🔴): joining via a scanned QR code instead of typing the code manually; explicitly verifying the realtime sync experience (the `onSnapshot`-based design already gives this "for free," just needs highlighting/testing when v1 is built); push notifications (evening reminder for open homework due tomorrow, staged test-countdown reminders, per-device-token targeted sends) — this last one needs Firebase Cloud Messaging plus a scheduled backend (Cloud Functions or similar), which this repo doesn't have yet, so it's a bigger infra addition than anything else here.

## Backlog

`TODO.md` in the repo root tracks the user's ongoing list of feature ideas/fixes (collected from their in-app Notizen), sorted easy → hard. Check it for pending work and check items off (don't delete) as they're completed.

## Standing conventions / user preferences

- User communicates in German; respond in German for this project.
- The Vibration API (`navigator.vibrate`) was investigated and explicitly **not** added — it's unsupported on iOS Safari (the user's actual device) and the user declined it once told it'd do nothing for them personally.
- When making a UI/animation change, prefer showing the user a live demo in the Browser pane over describing it, if they're actively watching.
- Non-trivial/architectural changes (new data model, security rules, anything touching how data is shared or stored) should go through a plan and explicit sign-off before implementation — this was the process used for the Bubble feature.
- Known low-priority, intentionally-left-alone issue: on the Settings page, the fixed Settings gear icon can visually overlap the ColorPicker's dashed "+" custom-color button when scrolled to a certain position. Noted, not fixed (small tap-target overlap, low impact).
