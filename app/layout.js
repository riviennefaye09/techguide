import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata = {
  title: 'ai-hotkey',
  description: 'Answers captured by the ai-hotkey desktop hotkey.',
  // Keep every answer out of search engines and browser prefetch.
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

/*
 * Runs before first paint so the saved theme applies without a white flash.
 * Default is dark, matching the portfolio.
 */
const themeInitScript = `(() => {
  try {
    const saved = localStorage.getItem('theme');
    const theme = saved === 'light' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
