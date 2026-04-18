type SteadyLogoProps = {
  className?: string;
};

export function SteadyLogo({ className }: SteadyLogoProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="steady-bg" x1="18" y1="18" x2="112" y2="114" gradientUnits="userSpaceOnUse">
          <stop stopColor="#141B2C" />
          <stop offset="1" stopColor="#0E1823" />
        </linearGradient>
        <radialGradient id="steady-ring-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(64 64) rotate(90) scale(42)">
          <stop stopColor="#FFF5D6" stopOpacity="0.42" />
          <stop offset="1" stopColor="#FFF5D6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="steady-ring" x1="28" y1="28" x2="102" y2="98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9CF76" />
          <stop offset="0.58" stopColor="#F6E3A4" />
          <stop offset="1" stopColor="#7DE7D8" />
        </linearGradient>
        <radialGradient id="steady-core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 51) rotate(59) scale(34)">
          <stop stopColor="#FFF9E8" />
          <stop offset="0.46" stopColor="#F9CF76" />
          <stop offset="0.82" stopColor="#D9A65E" />
          <stop offset="1" stopColor="#6FDCCF" />
        </radialGradient>
        <radialGradient id="steady-core-shadow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(64 74) rotate(-90) scale(24 28)">
          <stop stopColor="#0E2740" stopOpacity="0.85" />
          <stop offset="1" stopColor="#0E2740" stopOpacity="0" />
        </radialGradient>
        <filter id="steady-soft-glow" x="14" y="14" width="100" height="100" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="5.5" />
        </filter>
        <filter id="steady-star-glow" x="74" y="22" width="34" height="34" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <rect x="8" y="8" width="112" height="112" rx="28" fill="url(#steady-bg)" />
      <circle cx="64" cy="64" r="42" fill="url(#steady-ring-glow)" />

      <circle cx="64" cy="64" r="37" stroke="url(#steady-ring)" strokeWidth="6" />
      <circle cx="64" cy="64" r="37" stroke="url(#steady-ring)" strokeWidth="2" opacity="0.22" filter="url(#steady-soft-glow)" />

      <circle cx="64" cy="64" r="16" fill="url(#steady-core)" />
      <circle cx="64" cy="70" r="16" fill="url(#steady-core-shadow)" />

      <g filter="url(#steady-star-glow)" opacity="0.7">
        <path d="M88 32L89.9 38.1L96 40L89.9 41.9L88 48L86.1 41.9L80 40L86.1 38.1L88 32Z" fill="#FFD37C" />
      </g>
      <path d="M88 32L89.5 38.5L96 40L89.5 41.5L88 48L86.5 41.5L80 40L86.5 38.5L88 32Z" fill="#FFD37C" />
      <path d="M88 34.5L89 39L93.5 40L89 41L88 45.5L87 41L82.5 40L87 39L88 34.5Z" fill="#FFF6D9" />
    </svg>
  );
}
