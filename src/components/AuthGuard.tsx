"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginScreen from '@/components/LoginScreen';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Starting BhumiERP...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
