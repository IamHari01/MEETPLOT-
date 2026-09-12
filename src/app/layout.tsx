import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MEETPLOT | Meeting Slot Booking',
  description: 'A production-ready scheduling tool for booking meetings safely.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
