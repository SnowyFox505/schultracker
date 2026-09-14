export default function Input({ label, className = '', ...props }) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      {label && <span className="text-sm font-medium text-[var(--color-ink-dim)]">{label}</span>}
      <input
        className={`box-border w-full max-w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3.5 text-[16px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] transition-colors ${className}`}
        {...props}
      />
    </label>
  )
}
