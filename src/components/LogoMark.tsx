type LogoMarkProps = {
  className?: string;
};

/**
 * Umar Muhdhor monogram.
 *
 * The outer stroke is a U and doubles as the two stems of an M. The inner
 * valley completes the M, turning both initials into one continuous system.
 */
export default function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 64 64"
    >
      <path
        d="M10 8v30c0 12.15 8.76 18 22 18s22-5.85 22-18V8"
        stroke="currentColor"
        strokeLinecap="butt"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <path
        d="M10 13l22 19 22-19"
        stroke="currentColor"
        strokeLinecap="butt"
        strokeLinejoin="round"
        strokeWidth="7"
      />
    </svg>
  );
}
