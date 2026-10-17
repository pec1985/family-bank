import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Banky',
    short_name: 'Banky',
    description: 'La hucha de toda la familia',
    lang: 'es',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fffef5',
    theme_color: '#ffca18',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
