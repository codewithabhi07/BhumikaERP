"use client";

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Customer } from '@/types';
import { Plus, Trash2, User, MapPin, Phone, Search, Award, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ThekedarsPage() {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('bhumi_customers', []);
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [mobile, setMobile] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const addThekedar = () => {
    if (!name || !mobile) {
      toast.error('Please enter name and mobile number');
      return;
    }
    const newThekedar: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      mobile,
      village,
      isThekedar: true,
      totalOrders: 0,
      totalSpent: 0,
      balance: 0
    };
    setCustomers([...customers, newThekedar]);
    setName('');
    setVillage('');
    setMobile('');
    toast.success('Thekedar account created');
  };

  const deleteThekedar = (id: string) => {
    toast('Delete this thekedar account?', {
      description: 'All linked transaction balances will be removed from this view.',
      action: {
        label: 'Delete',
        onClick: () => {
          setCustomers(customers.filter(c => c.id !== id));
          toast.success('Account deleted');
        },
      },
    });
  };

  const filteredThekedars = customers.filter(c => 
    c.isThekedar && 
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.mobile.includes(searchQuery))
  );

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tighter">Thekedar Accounts</h1>
          <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">Manage Contractor Credits & Profiles</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-sm border border-emerald-100 shadow-sm transition-all hover:scale-105">
          <Award size={20} />
          {filteredThekedars.length} Registered Accounts
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="erp-card h-fit">
          <div className="erp-card-header">
            <span className="erp-card-title">Register New Thekedar</span>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="erp-label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className="erp-input pl-12 font-bold" placeholder="e.g. Sunil Patil"
                />
              </div>
            </div>
            <div>
              <label className="erp-label">Village / City</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" value={village} onChange={e => setVillage(e.target.value)}
                  className="erp-input pl-12 font-bold" placeholder="e.g. Parola"
                />
              </div>
            </div>
            <div>
              <label className="erp-label">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" value={mobile} onChange={e => setMobile(e.target.value)}
                  className="erp-input pl-12 font-bold" placeholder="10 Digit Number"
                />
              </div>
            </div>
            <button 
              onClick={addThekedar}
              className="btn-primary w-full !py-4 uppercase tracking-[0.2em] text-xs mt-4 border-b-4 border-emerald-800"
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="erp-card overflow-hidden transition-all hover:shadow-lg">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" placeholder="Search accounts..." 
                className="bg-transparent outline-none font-bold text-sm w-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Thekedar Name</th>
                  <th>Location</th>
                  <th className="text-right">Balance Due</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredThekedars.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-slate-300 font-bold italic">No Thekedar accounts found.</td>
                  </tr>
                ) : (
                  filteredThekedars.map((c) => (
                    <tr key={c.id} className="group transition-colors">
                      <td>
                        <div className="font-bold text-slate-800 uppercase text-xs">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{c.mobile}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-slate-500 font-bold text-[10px] uppercase">
                          <MapPin size={12} /> {c.village || 'N/A'}
                        </div>
                      </td>
                      <td className="text-right">
                        <span className={`font-black text-sm ${c.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          ₹ {(c.balance || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/thekedar/${c.id}`} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-lg border border-slate-100">
                            <FileText size={18} />
                          </Link>
                          <button onClick={() => deleteThekedar(c.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-lg border border-slate-100">
                            <Trash2 size={18} />
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
  );
}
