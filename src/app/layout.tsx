import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quiz Funnel App',
  description: 'Interactive quiz funnel for product recommendations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
