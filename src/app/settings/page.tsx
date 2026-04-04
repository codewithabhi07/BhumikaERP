"use client";

import React, { useState, useEffect } from 'react';
import { SettingsService } from '@/lib/api';
import { Settings as SettingsIcon, Save, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [shopName, setShopName] = useState('Bhumika Tiles & Building Material');
  const [managerName, setManagerName] = useState('Rohit Chavan');
  const [phone, setPhone] = useState('8010060992');
  const [location, setLocation] = useState('Parola');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SettingsService.get().then(data => {
      if (data) {
        setShopName(data.shopName || '');
        setManagerName(data.managerName || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      await SettingsService.update({
        shopName,
        managerName,
        phone,
        location
      });
      toast.success('Business profile updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleReset = () => {
    toast('DANGER: This action is disabled in the API version', {
      description: 'Please contact support to reset the database.',
    });
  };

  if (loading) return <div className="p-8 text-center font-bold text-slate-400">Loading settings...</div>;

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
            onClick={handleSave}
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
            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">System-wide data reset is disabled in the current API implementation.</p>
            <button 
              disabled
              className="w-full border-2 border-gray-100 text-gray-400 p-4 rounded-xl font-black uppercase tracking-widest text-[10px] cursor-not-allowed"
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
