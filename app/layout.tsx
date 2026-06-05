import './globals.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'COTSignal - CFTC positioning, not signals',
  description: 'Free dashboard of CFTC Commitments of Traders positioning extremes. Percentile rank vs 3yr range across 8 majors. This is positioning data not a buy signal.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <header className="border-b border-zinc-800">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold tracking-tight">COTSignal</a>
            <nav className="flex gap-4 text-sm text-zinc-400">
              <a href="/" className="hover:text-zinc-100">Dashboard</a>
              <a href="/about" className="hover:text-zinc-100">About</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t border-zinc-800">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-zinc-500">
            Source: CFTC Commitments of Traders, Legacy report. Updated weekly Fridays 3:30pm ET.
            This is positioning data, not a buy or sell signal. Not investment advice.
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
