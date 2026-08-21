"use client";

import React, { useState, useEffect } from 'react';
import { SettingsService, EstimateService, ProductService, CustomerService, KhatabookService, EmployeeService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Settings as SettingsIcon, 
  Save, 
  Trash2, 
  ShieldCheck, 
  KeyRound, 
  Download, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  Lock, 
  Sparkles,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { updateSecurityPin } = useAuth();
  const [shopName, setShopName] = useState('Bhumika Tiles & Building Material');
  const [managerName, setManagerName] = useState('Rohit Chavan');
  const [phone, setPhone] = useState('8010060992');
  const [location, setLocation] = useState('Parola, Dist. Jalgaon');
  const [managerPin, setManagerPin] = useState('1234');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SettingsService.get().then(data => {
      if (data) {
        setShopName(data.shopName || 'Bhumika Tiles & Building Material');
        setManagerName(data.managerName || 'Rohit Chavan');
        setPhone(data.phone || '8010060992');
        setLocation(data.location || 'Parola, Dist. Jalgaon');
        if (data.managerPin) setManagerPin(String(data.managerPin));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    try {
      await SettingsService.update({
        shopName,
        managerName,
        phone,
        location,
        managerPin
      });
      toast.success('Business profile & settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleUpdatePin = async () => {
    if (!managerPin || managerPin.trim().length < 4) {
      toast.error('PIN / password should be at least 4 characters');
      return;
    }
    const success = await updateSecurityPin(managerPin.trim());
    if (success) {
      toast.success('New login PIN saved!');
    }
  };

  const handleExportBackup = async () => {
    try {
      const [est, prod, cust, khata, emp, sett] = await Promise.all([
        EstimateService.getAll().catch(() => []),
        ProductService.getAll().catch(() => []),
        CustomerService.getAll().catch(() => []),
        KhatabookService.getAll().catch(() => []),
        EmployeeService.getAll().catch(() => []),
        SettingsService.get().catch(() => ({}))
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        version: "2.0.0",
        settings: sett,
        estimates: est,
        products: prod,
        customers: cust,
        khatabook: khata,
        employees: emp
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhumikaERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Database backup exported successfully');
    } catch (error) {
      toast.error('Failed to export backup');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            System & Security Settings
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure business header, manage login PIN, and export database backup
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="btn-outline flex items-center gap-2 text-slate-700 hover:text-emerald-700 shadow-sm"
        >
          <Download size={15} />
          <span>Export Full Backup (JSON)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Business Profile Form */}
        <div className="erp-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 text-slate-800 border-b border-slate-100 pb-3 mb-2">
            <Building2 size={18} className="text-emerald-600" />
            <h3 className="font-black uppercase text-xs tracking-wider">
              Business Profile Information
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="erp-label">Shop / Firm Name</label>
              <input 
                type="text" 
                className="erp-input font-bold"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>

            <div>
              <label className="erp-label">Manager / Owner Name</label>
              <input 
                type="text" 
                className="erp-input font-bold"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />
            </div>

            <div>
              <label className="erp-label">Contact Mobile Number</label>
              <input 
                type="text" 
                className="erp-input font-bold font-mono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="erp-label">Store Location / Address</label>
              <input 
                type="text" 
                className="erp-input font-bold"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            onClick={handleSaveProfile}
            className="btn-primary w-full py-3.5 mt-2 uppercase tracking-widest text-xs shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2"
          >
            <Save size={15} /> Save Business Profile
          </button>
        </div>

        {/* Right Column: Security PIN & Backup & About */}
        <div className="space-y-6">
          {/* Security PIN Card */}
          <div className="erp-card p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 border-b border-slate-100 pb-3 mb-2">
              <KeyRound size={18} className="text-emerald-600" />
              <h3 className="font-black uppercase text-xs tracking-wider">
                Manager Login Security PIN
              </h3>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Set the 4-digit PIN or password required to sign in to the BhumiERP system.
            </p>

            <div>
              <label className="erp-label">Current / New Manager PIN</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  className="erp-input pl-10 font-mono font-bold text-sm tracking-widest"
                  placeholder="e.g. 1234"
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleUpdatePin}
              className="btn-secondary w-full py-3 uppercase tracking-widest text-xs shadow-md"
            >
              Update Login PIN
            </button>
          </div>

          {/* Database Backup Card */}
          <div className="erp-card p-6 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
            
            <div className="flex items-center gap-2.5 text-emerald-400 mb-2 relative z-10">
              <Database size={18} />
              <h3 className="font-black uppercase text-xs tracking-wider">
                Data Backup & Safety
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-medium mb-4 relative z-10 leading-relaxed">
              Export all customer bills, stock database, thekedar statements, and staff records into a single JSON file.
            </p>

            <button
              onClick={handleExportBackup}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative z-10 shadow-lg shadow-emerald-950/40"
            >
              <Download size={14} /> Download Database Backup
            </button>
          </div>

          {/* Version Info Pill */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>BhumiERP Enterprise</span>
            </div>
            <span className="font-extrabold text-[10px] uppercase bg-emerald-200/80 px-2 py-0.5 rounded-full text-emerald-800">
              v2.0.4 Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
