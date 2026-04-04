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
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import Image from 'next/image';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Create Bill', icon: Receipt, href: '/estimate/new' },
  { name: 'Bill History', icon: History, href: '/history' },
  { name: 'Stock Inventory', icon: Package, href: '/products' },
  { name: 'Khatabook', icon: BookOpen, href: '/khatabook' },
  { name: 'Thekedar Accounts', icon: ShieldCheck, href: '/thekedars' },
  { name: 'Staff Management', icon: Users, href: '/employees' },
  { name: 'System Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 flex flex-col no-print border-r border-slate-800 z-50">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white shadow-lg relative overflow-hidden">
          <Image src="/logo.png" alt="Logo" fill className="object-contain invert grayscale brightness-200" unoptimized />
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider leading-none">BHUMIKA ERP</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Management System</p>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Main Menu</p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-4 py-2.5 rounded transition-all duration-200 group",
                  isActive 
                    ? "bg-emerald-600 text-white shadow-md" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={clsx(isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-white/50" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-emerald-600 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="w-8 h-8 bg-emerald-600/20 text-emerald-500 rounded flex items-center justify-center font-bold text-xs relative z-10">RC</div>
          <div className="flex-1 overflow-hidden relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase truncate">Manager</p>
            <p className="text-xs font-bold text-white truncate uppercase">Rohit Chavan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
