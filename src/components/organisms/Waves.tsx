export function Waves({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 180"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 96c180-48 320 24 520 24s340-72 520-48 260 60 400 60v48H0Z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M0 128c200-40 300 16 480 16s360-56 540-36 280 52 420 52v20H0Z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  );
}
