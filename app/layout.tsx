import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tvoje Hnízdo – Admin', description: 'Interní administrace' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='cs'>
      <body className='bg-gray-50 text-gray-900'>{children}</body>
    </html>
  );
}
