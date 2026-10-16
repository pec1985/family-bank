import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Family Bank',
  description: 'La hucha de toda la familia',
};
export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
