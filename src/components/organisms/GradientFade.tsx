export function GradientFade({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        background:
          "linear-gradient(to bottom, transparent 0%, color-mix(in oklch, var(--color-base-100) 60%, transparent) 55%, var(--color-base-100) 100%)",
      }}
    />
  );
}
