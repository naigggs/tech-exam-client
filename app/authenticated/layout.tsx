'use client';

import AppSidebar from '@/components/shared/app-sidebar';
import Sidebar from '@/components/shared/sidebar';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <main className={`flex-1 transition-all duration-300`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppSidebar>{children}</AppSidebar>
        </ThemeProvider>
      </main>
    </div>
  );
}