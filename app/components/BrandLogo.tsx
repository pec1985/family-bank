import Image from 'next/image';

export default function BrandLogo({ className, size }: { className: string; size: number }) {
  return (
    <Image
      src="/brand/banky.webp"
      alt="Banky"
      className={`${className} brand-logo`}
      width={size}
      height={size}
      sizes={`${size}px`}
    />
  );
}
