"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { CustomerService } from '@/lib/api';
import { Customer } from '@/types';
import { 
  Plus, 
  Trash2, 
  User, 
  MapPin, 
  Phone, 
  Search, 
  Award, 
  FileText, 
  ExternalLink,
  X,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ThekedarsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [mobile, setMobile] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await CustomerService.getAll();
        setCustomers(data || []);
      } catch (error) {
        toast.error('Failed to load Thekedar accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const addThekedar = async () => {
    if (!name.trim() || !mobile.trim()) {
      toast.error('Please enter contractor name and mobile number');
      return;
    }
    const newThekedar: Partial<Customer> = {
      name: name.trim(),
      mobile: mobile.trim(),
      village: village.trim(),
      isThekedar: true,
      totalOrders: 0,
      totalSpent: 0,
      balance: 0
    };
    
    try {
      const saved = await CustomerService.create(newThekedar);
      setCustomers([...customers, saved]);
      setName('');
      setVillage('');
      setMobile('');
      toast.success('Contractor profile created successfully');
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const deleteThekedar = (id: string) => {
    toast('Delete this contractor profile?', {
      description: 'The contractor profile will be removed from the master registry.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await CustomerService.delete(id);
            setCustomers(prev => prev.filter(c => c.id !== id));
            toast.success('Contractor profile removed');
          } catch (error) {
            toast.error('Failed to delete profile');
          }
        },
      },
    });
  };

  const filteredThekedars = useMemo(() => {
    return customers.filter(c => 
      c.isThekedar && 
      ((c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.mobile || '').includes(searchQuery) || (c.village || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [customers, searchQuery]);

  const totalOutstanding = filteredThekedars.reduce((sum, c) => sum + (c.balance || 0), 0);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Contractors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Thekedar Accounts & Credits
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Registered contractors, running ledgers, and statement reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs font-bold shadow-sm">
            <Award size={16} className="text-emerald-600" />
            <span>{filteredThekedars.length} Contractors</span>
          </div>
          <div className="px-4 py-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 flex items-center gap-2 text-xs font-bold shadow-sm">
            <Wallet size={16} className="text-amber-600" />
            <span>Total Due: ₹ {totalOutstanding.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Register Card */}
        <div className="erp-card p-6 h-fit sticky top-20">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
              <Award size={16} className="text-emerald-600" />
              Register New Contractor
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="erp-label">Contractor Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="erp-input pl-10 font-bold" 
                  placeholder="e.g. Sunil Patil"
                />
              </div>
            </div>

            <div>
              <label className="erp-label">Village / Location</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={village} 
                  onChange={e => setVillage(e.target.value)}
                  className="erp-input pl-10 font-bold" 
                  placeholder="e.g. Parola / Lasur"
                />
              </div>
            </div>

            <div>
              <label className="erp-label">Mobile Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={mobile} 
                  onChange={e => setMobile(e.target.value)}
                  className="erp-input pl-10 font-bold" 
                  placeholder="10-digit number"
                />
              </div>
            </div>

            <button 
              onClick={addThekedar}
              className="btn-primary w-full py-3.5 mt-2 uppercase tracking-widest text-xs shadow-md shadow-emerald-950/20"
            >
              Create Thekedar Account
            </button>
          </div>
        </div>

        {/* Right Column: Contractor Directory Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="erp-card overflow-hidden">
            {/* Search toolbar */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, village, or mobile number..." 
                className="bg-transparent outline-none font-bold text-xs sm:text-sm w-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Thekedar Name</th>
                    <th>Location</th>
                    <th className="text-right">Balance Due</th>
                    <th className="text-right">Statement & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredThekedars.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-16 text-center text-slate-400 font-bold italic text-sm">
                        No contractor accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredThekedars.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td>
                          <div className="font-extrabold text-slate-800 uppercase text-xs sm:text-sm">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-semibold font-mono">
                            {c.mobile}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-slate-600 font-bold text-xs uppercase">
                            <MapPin size={13} className="text-slate-400" /> 
                            <span>{c.village || 'Local'}</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <span className={`font-black text-xs sm:text-sm font-mono ${
                            (c.balance || 0) > 0 ? 'text-red-600' : 'text-emerald-700'
                          }`}>
                            ₹ {(c.balance || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link 
                              href={`/thekedar/${c.id}`} 
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition-colors border border-emerald-200 flex items-center gap-1 shadow-sm"
                            >
                              <FileText size={13} />
                              <span>Statement</span>
                            </Link>
                            <button 
                              onClick={() => deleteThekedar(c.id)} 
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200 shadow-sm"
                              title="Delete Profile"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
