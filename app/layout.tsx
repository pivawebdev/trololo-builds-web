import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trololo Builds - Albion Online',
  description: 'Crie e compartilhe suas builds de Albion Online',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
