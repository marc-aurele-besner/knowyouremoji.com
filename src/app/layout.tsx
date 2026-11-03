import type { Metadata } from 'next';
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
                <main className="flex-1">{children}</main>
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
