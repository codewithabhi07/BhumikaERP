"use client";

import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Settings as SettingsIcon, Save, Trash2, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [shopName, setShopName] = useLocalStorage('bhumi_shop_name', 'Bhumika Plywood & Building Material');
  const [managerName, setManagerName] = useLocalStorage('bhumi_manager_name', 'Rohit Chavan');
  const [phone, setPhone] = useLocalStorage('bhumi_phone', '8010060992');
  const [location, setLocation] = useLocalStorage('bhumi_location', 'Parola');

  return (
    <div className="py-4 max-w-4xl">
      <h1 className="text-3xl font-black text-secondary tracking-tight mb-8">System Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-primary mb-2">
            <SettingsIcon size={20} />
            <h3 className="font-black uppercase text-xs tracking-widest">Business Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block ml-1">Shop Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-secondary"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block ml-1">Manager Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-secondary"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block ml-1">Phone Number</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-secondary"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block ml-1">Location</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-secondary"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <button className="w-full bg-secondary text-white p-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2">
            <Save size={16} /> Save Business Profile
          </button>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 text-red-500 mb-6">
              <Trash2 size={20} />
              <h3 className="font-black uppercase text-xs tracking-widest">Data Management</h3>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-6">Clear all local storage data including estimates, products, and profile settings.</p>
            <button 
              onClick={() => {
                if(confirm('DANGER: This will delete EVERYTHING. Proceed?')) {
                  localStorage.clear();
                  window.location.href = '/';
                }
              }}
              className="w-full border-2 border-red-100 text-red-500 p-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all"
            >
              Reset Entire Application
            </button>
          </div>

          <div className="bg-emerald-500 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <ShieldCheck size={120} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
            <h3 className="text-xl font-black mb-2 tracking-tighter">Premium Verified</h3>
            <p className="text-sm font-medium opacity-80 leading-relaxed">Your application is optimized with 3-Table contractor logic and offline data persistence.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
