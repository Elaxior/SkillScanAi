/**
 * Root Layout - Updated with Error Boundary & Toast
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import NavBar from '@/components/layout/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SkillScan AI - AI Sports Analysis',
  description: 'Analyze your athletic form with AI-powered biomechanical analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        <ErrorBoundary>
          <ToastProvider>
            <NavBar />
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
