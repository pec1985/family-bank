import Image from 'next/image';

export default function BrandLogo({ className, size }: { className: string; size: number }) {
  return (
    <Image
      className={`${className} brand-logo`}
      src="/brand/family-bank.png"
      alt="Family Bank"
      width={size}
      height={size}
      priority
    />
  );
}
