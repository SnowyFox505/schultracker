// Page heading that leaves room for the floating Bubble and Settings buttons on mobile.
export default function PageTitle({ children, className = '' }) {
  return (
    <h1 className={`pr-24 font-[var(--font-display)] text-[clamp(1.5rem,7.6vw,1.875rem)] font-extrabold leading-tight md:pr-0 md:text-4xl ${className}`}>
      {children}
    </h1>
  )
}
