import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { AppStateProvider } from '@/context/app-state-context';
import { PicMinderSidebar } from '@/components/picminder/picminder-sidebar';

export const metadata: Metadata = {
  title: 'PicMinder',
  description: 'Your intelligent photo assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased h-full bg-background">
        <AppStateProvider>
          <div className="flex h-full">
            <PicMinderSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              {children}
            </div>
          </div>
          <Toaster />
        </AppStateProvider>
      </body>
    </html>
  );
}
