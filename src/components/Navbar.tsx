"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProductService } from '@/lib/api';
import { 
  Menu, 
  Bell, 
  Plus, 
  LogOut, 
  Calendar, 
  Clock, 
  Package, 
  AlertTriangle, 
  Shield, 
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export default function Navbar({ onToggleMobileSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const timeFormatted = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentDateTime(`${dateFormatted} • ${timeFormatted}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    ProductService.getAll()
      .then((products) => {
        const count = (products || []).filter(
          (p: any) => (p.stock || 0) <= (p.minStock || 5)
        ).length;
        setLowStockCount(count);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 no-print transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Brand/Time */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu size={22} />
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600">
            <Clock size={13} className="text-emerald-600" />
            <span className="font-mono text-[11px]">{currentDateTime}</span>
          </div>
        </div>

        {/* Right Side: Quick Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Low Stock Warning Pill */}
          {lowStockCount > 0 && (
            <Link
              href="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 rounded-xl text-xs font-bold transition-colors shadow-sm"
              title={`${lowStockCount} items low in stock`}
            >
              <AlertTriangle size={14} className="text-amber-600 animate-pulse" />
              <span className="hidden md:inline">Low Stock:</span>
              <span className="bg-amber-200/80 px-1.5 py-0.2 rounded text-[10px]">{lowStockCount}</span>
            </Link>
          )}

          {/* Quick Create Bill Button */}
          <Link
            href="/estimate/new"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Bill</span>
          </Link>

          {/* User Profile Badge */}
          {user && (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-xs shadow-inner">
                  {user.avatarText}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5 capitalize">{user.role}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
