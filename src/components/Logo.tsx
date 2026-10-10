export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand)" />
          <stop offset="1" stopColor="#c26bd6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logo-g)" />
      <circle cx="11" cy="11" r="3.1" fill="#fff" opacity="0.95" />
      <circle cx="21" cy="11" r="3.1" fill="#fff" opacity="0.62" />
      <circle cx="11" cy="21" r="3.1" fill="#fff" opacity="0.62" />
      <circle cx="21" cy="21" r="3.1" fill="#fff" opacity="0.95" />
    </svg>
  );
}
