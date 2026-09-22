// Shared by the manual "App aktualisieren" button (SettingsApp.jsx) and the update banner: clears
// the service worker + caches and reloads onto the changelog, with a small celebration after.
export async function refreshApp() {
  const minWait = new Promise((r) => setTimeout(r, 3000))
  try {
    const regs = await navigator.serviceWorker?.getRegistrations()
    await Promise.all((regs || []).map((r) => r.unregister()))
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  } catch {
    // still reload below
  }
  await minWait
  try {
    sessionStorage.setItem('justUpdated', '1')
  } catch {
    // storage unavailable — the celebration just won't show
  }
  window.location.replace('/einstellungen/neuigkeiten')
}
