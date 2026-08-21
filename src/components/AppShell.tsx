"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
          {/* Main Sidebar */}
          <Sidebar 
            mobileOpen={mobileSidebarOpen} 
            onCloseMobile={() => setMobileSidebarOpen(false)} 
          />

          {/* Right Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64 print:pl-0 transition-all duration-300">
            {/* Top Navigation Bar */}
            <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

            {/* Page View Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 max-w-[1600px] w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </AuthGuard>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
