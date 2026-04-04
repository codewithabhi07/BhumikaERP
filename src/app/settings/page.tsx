"use client";

import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Settings as SettingsIcon, Save, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [shopName, setShopName] = useLocalStorage('bhumi_shop_name', 'Bhumika Tiles & Building Material');
  const [managerName, setManagerName] = useLocalStorage('bhumi_manager_name', 'Rohit Chavan');
  const [phone, setPhone] = useLocalStorage('bhumi_phone', '8010060992');
  const [location, setLocation] = useLocalStorage('bhumi_location', 'Parola');

  const handleReset = () => {
    toast('DANGER: This will delete ALL business data', {
      description: 'Estimates, Products, Khatabook, and Staff records will be permanently removed.',
      action: {
        label: 'Reset All',
        onClick: () => {
          localStorage.clear();
          window.location.href = '/';
        },
      },
    });
  };

  return (
    <div className="py-4 max-w-4xl">
      <h1 className="text-3xl font-black text-secondary tracking-tight mb-8">System Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="erp-card p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-primary mb-2">
            <SettingsIcon size={20} />
            <h3 className="font-black uppercase text-xs tracking-widest">Business Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="erp-label">Shop Name</label>
              <input 
                type="text" 
                className="erp-input font-bold"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div>
              <label className="erp-label">Manager Name</label>
              <input 
                type="text" 
                className="erp-input font-bold"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />
            </div>
            <div>
              <label className="erp-label">Phone Number</label>
              <input 
                type="text" 
                className="erp-input font-bold"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="erp-label">Location</label>
              <input 
                type="text" 
                className="erp-input font-bold"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            onClick={() => toast.success('Business profile updated')}
            className="w-full bg-secondary text-white p-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2 border-b-4 border-black"
          >
            <Save size={16} /> Save Business Profile
          </button>
        </div>

        <div className="space-y-8">
          <div className="erp-card p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 text-red-500 mb-6">
              <Trash2 size={20} />
              <h3 className="font-black uppercase text-xs tracking-widest">Data Management</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">Wipe all local storage data including estimates, products, and profile settings. This action is not reversible.</p>
            <button 
              onClick={handleReset}
              className="w-full border-2 border-red-100 text-red-500 p-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all active:scale-95"
            >
              Reset Entire Application
            </button>
          </div>

          <div className="bg-emerald-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white rounded-full blur-3xl opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
            <ShieldCheck size={120} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
            <h3 className="text-xl font-black mb-2 tracking-tighter uppercase">ERP Premium</h3>
            <p className="text-xs font-bold opacity-80 leading-relaxed uppercase tracking-widest">Version 2.0.4 • Optimized for Tiles Industry</p>
          </div>
        </div>
      </div>
    </div>
  );
}
