/** Logo Storagemate: robot trong bong bóng chat (teal + kem) với ăng-ten cam. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Storagemate"
      className="shrink-0"
    >
      <rect width="64" height="64" rx="14" fill="var(--color-pine)" />
      <path
        d="M14 18.5A5.5 5.5 0 0 1 19.5 13h25A5.5 5.5 0 0 1 50 18.5v15A5.5 5.5 0 0 1 44.5 39H37l-8.2 8.6c-.9 1-2.6.4-2.6-1V39H19.5A5.5 5.5 0 0 1 14 33.5z"
        fill="var(--color-cream)"
      />
      <circle cx="25" cy="26" r="3" fill="var(--color-pine)" />
      <circle cx="39" cy="26" r="3" fill="var(--color-pine)" />
      <path
        d="M26.5 32.5c1.6 1.3 3.4 2 5.5 2s3.9-.7 5.5-2"
        stroke="var(--color-pine)"
        strokeWidth="2.1"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M32 13V7.5" stroke="var(--color-accent)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="32" cy="5.5" r="2.4" fill="var(--color-accent)" />
    </svg>
  )
}

/** Wordmark "storagemate" chữ thường: pine trên nền sáng, kem trên nền tối. */
export function Wordmark({
  className = '',
  tone = 'dark',
}: {
  className?: string
  tone?: 'dark' | 'light'
}) {
  return (
    <span
      className={`text-[20px] leading-none font-extrabold lowercase tracking-[-0.03em] whitespace-nowrap ${
        tone === 'light' ? 'text-cream' : 'text-pine'
      } ${className}`}
    >
      storagemate
    </span>
  )
}
