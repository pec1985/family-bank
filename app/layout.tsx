import type { Metadata } from 'next';
import './globals.css';
import AppTheme from './components/AppTheme';
export const metadata: Metadata = {
  title: 'Banky',
  description: 'La hucha de toda la familia',
  applicationName: 'Banky',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, title: 'Banky', statusBarStyle: 'default' },
};
export const viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppTheme>{children}</AppTheme>
      </body>
    </html>
  );
}
