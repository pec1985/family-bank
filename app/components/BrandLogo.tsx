export default function BrandLogo({ className, size }: { className: string; size: number }) {
  return (
    <span
      className={`${className} brand-logo`}
      role="img"
      aria-label="Banky"
      style={{ width: size, height: size }}
    >
      €
    </span>
  );
}
