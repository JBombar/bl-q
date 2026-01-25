import type { Metadata } from 'next';
import { Inter, Figtree } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Test stresu Better Lady',
  description: 'Je tvůj nervový systém přehlcený? Zjisti to pomocí našeho testu.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${inter.variable} ${figtree.variable}`}>
      <body className="font-sans antialiased" style={{ fontFamily: 'var(--font-figtree), var(--font-inter), sans-serif' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
