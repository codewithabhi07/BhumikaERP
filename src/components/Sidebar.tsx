"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  History, 
  Package, 
  Settings, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Scissors, 
  Truck, 
  ChevronRight, 
  LogOut, 
  X, 
  Building2, 
  Phone 
} from 'lucide-react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Create Bill', icon: Receipt, href: '/estimate/new' },
  { name: 'Cutting & Challans', icon: Scissors, href: '/challans' },
  { name: 'Bill History', icon: History, href: '/history' },
  { name: 'Stock Inventory', icon: Package, href: '/products' },
  { name: 'Khatabook', icon: BookOpen, href: '/khatabook' },
  { name: 'Thekedar Accounts', icon: ShieldCheck, href: '/thekedars' },
  { name: 'Staff Management', icon: Users, href: '/employees' },
  { name: 'System Settings', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={onCloseMobile}>
          <div className="relative w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden group-hover:border-emerald-500/50 transition-colors">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={26} 
              height={26} 
              className="object-contain invert brightness-200" 
              unoptimized 
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-white tracking-wider uppercase leading-none group-hover:text-emerald-400 transition-colors">
                BHUMIKA ERP
              </h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Building Material Hub
            </p>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {/* Menu Links */}
      <div className="p-3.5 flex-1 overflow-y-auto space-y-6">
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2.5">
            Main Navigation
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={onCloseMobile}
                  className={clsx(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative font-medium text-xs sm:text-sm",
                    isActive 
                      ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-950/50" 
                      : "hover:bg-slate-900 hover:text-white text-slate-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      size={18} 
                      className={clsx(
                        "transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"
                      )} 
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Contact & Info Card */}
        <div className="px-3 py-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-400 mb-1">
            <Building2 size={12} />
            <span>Store Location</span>
          </div>
          <p className="text-[11px] font-bold text-slate-200">Parola, Dist. Jalgaon</p>
          <p className="text-[10px] text-slate-300 font-mono mt-0.5 flex items-center gap-1">
            <Phone size={10} /> +91 8010060992
          </p>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950">
        <div className="flex items-center justify-between p-2.5 bg-slate-900/90 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shadow-md">
              {user?.avatarText || 'RC'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || 'Rohit Chavan'}
              </p>
              <p className="text-[10px] font-semibold text-emerald-400 truncate uppercase tracking-tight">
                {user?.role || 'Manager'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 no-print border-r border-slate-800/80 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 transition-opacity"
          onClick={onCloseMobile}
        >
          {/* Mobile Drawer Panel */}
          <div 
            className="w-72 max-w-[85vw] h-full bg-slate-950 shadow-2xl border-r border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
