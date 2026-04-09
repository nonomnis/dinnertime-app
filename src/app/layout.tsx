import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DinnerTime - Family Dinner Planning',
    template: '%s | DinnerTime',
  },
  description: 'Plan family dinners together with ease',
  manifest: '/manifest.json',
  keywords: ['family', 'dinner', 'planning', 'meal', 'schedule'],
  authors: [{ name: 'DinnerTime Team' }],
  creator: 'DinnerTime',
  publisher: 'DinnerTime',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dinnertime.app',
    title: 'DinnerTime - Family Dinner Planning',
    description: 'Plan family dinners together with ease',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DinnerTime',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DinnerTime',
    description: 'Plan family dinners together with ease',
    images: ['/twitter-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DinnerTime',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#E53935',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#E53935" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DinnerTime" />
        <meta name="apple-mobile-web-app-icon" content="/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen-mobile bg-warm-50 overflow-x-hidden font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
