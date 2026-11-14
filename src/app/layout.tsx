import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { siteMetadata, DEFAULT_DESCRIPTION, getSiteUrl, getSiteName } from '@/lib/metadata';
import { SiteJsonLd } from '@/components/seo/site-json-ld';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { PostHogProvider } from '@/components/analytics/posthog';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import { SessionProvider } from 'next-auth/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Serif for the italic `.accent-serif` words in a few headlines outside
// /guides (home, about, interpreter...). Not preloaded: the browser only
// fetches it on pages that actually render one of those accents. The /guides
// section declares its own preloaded copy in src/app/guides/layout.tsx.
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  preload: false,
});

export const metadata: Metadata = siteMetadata;

/**
 * Viewport-level metadata.
 *
 * `themeColor` sets the browser chrome colour on mobile. Without it the
 * address bar falls back to a default that does not match the brand, and
 * the theme colour declared in `site.webmanifest` is only used once the
 * app is installed.
 */
export const viewport: Viewport = {
  themeColor: '#f59e0b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Site-wide publisher identity: Organization + WebSite. Emitted once
            here so every route inherits it. */}
        <SiteJsonLd
          appUrl={getSiteUrl()}
          appName={getSiteName()}
          description={DEFAULT_DESCRIPTION}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <SessionProvider>
          <PostHogProvider>
            <ThemeProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                {/* Skip link: the first tab stop on every page, so keyboard
                    and screen-reader users can jump past the header nav
                    straight to the content. The wrapper is a `div`, not a
                    `main`: each route renders its own single `<main>`
                    landmark, and nesting a second one inside the layout
                    produced two `main` landmarks per document, which is
                    invalid HTML and splits the landmark for assistive
                    tech. */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
                >
                  Skip to content
                </a>
                <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
                  {children}
                </div>
                <Footer />
              </div>
            </ThemeProvider>
            <GoogleAnalytics />
            <ServiceWorkerRegister />
          </PostHogProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
