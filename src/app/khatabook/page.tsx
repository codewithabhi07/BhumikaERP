"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { KhatabookService } from '@/lib/api';
import { KhatabookEntry } from '@/types';
import { 
  Plus, 
  Trash2, 
  Search, 
  MessageCircle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  User, 
  Phone, 
  Award, 
  BookOpen, 
  X,
  Wallet,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { toast } from 'sonner';
import { getWhatsAppUrl } from '@/lib/utils';

export default function KhatabookPage() {
  const [entries, setEntries] = useState<KhatabookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'take' | 'give'>('take');
  
  // Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    KhatabookService.getAll().then(data => {
      setEntries(data || []);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load Khatabook records');
      setLoading(false);
    });
  }, []);

  const addEntry = async () => {
    if (!name.trim() || !amount) {
      toast.error('Customer name and amount are required');
      return;
    }
    const newEntry: Partial<KhatabookEntry> = {
      name: name.trim(),
      mobile: mobile.trim(),
      amount: Number(amount),
      type: activeTab,
      dueDate,
      notes: notes.trim(),
      createdAt: new Date().toLocaleDateString('en-IN')
    };
    
    try {
      const saved = await KhatabookService.create(newEntry);
      setEntries([...entries, saved]);
      
      // Reset Form
      setName('');
      setMobile('');
      setAmount('');
      setDueDate('');
      setNotes('');
      toast.success(`Recorded ₹${Number(amount).toLocaleString('en-IN')} in ${activeTab === 'take' ? 'Receivable' : 'Payable'}`);
    } catch (error) {
      toast.error('Failed to add entry');
    }
  };

  const deleteEntry = (id: string) => {
    toast('Delete this ledger entry?', {
      description: 'The record will be permanently deleted from Khatabook.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await KhatabookService.delete(id);
            setEntries(prev => prev.filter(e => e.id !== id));
            toast.success('Entry deleted');
          } catch (error) {
            toast.error('Failed to delete entry');
          }
        },
      },
    });
  };

  const sendWhatsApp = (entry: KhatabookEntry) => {
    if (!entry.mobile) {
      toast.error('Mobile number not available for this record');
      return;
    }
    
    let message = "";
    if (entry.type === 'take') {
      message = `Hello ${entry.name}, this is a gentle reminder from *Bhumika Tiles & Building Material* regarding a pending payment of *₹${entry.amount.toLocaleString('en-IN')}*. Please settle it by ${entry.dueDate || 'the earliest'}. Thank you!`;
    } else {
      message = `Hello ${entry.name}, this is regarding the payment of *₹${entry.amount.toLocaleString('en-IN')}* from *Bhumika Tiles*. We plan to settle it by ${entry.dueDate || 'soon'}. Thank you for your patience!`;
    }
    
    const url = getWhatsAppUrl(entry.mobile, message);
    window.open(url, '_blank');
    toast.success('WhatsApp reminder opened');
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.type === activeTab && 
      ((e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.mobile || '').includes(searchQuery))
    );
  }, [entries, activeTab, searchQuery]);

  const totalTake = entries.filter(e => e.type === 'take').reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalGive = entries.filter(e => e.type === 'give').reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Khatabook...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Khatabook & Credit Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track customer balances, payment reminders, and supplier payables
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/thekedars" 
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 transition-colors shadow-sm"
          >
            <Award size={16} className="text-emerald-600" />
            <span>Thekedar Accounts</span>
          </Link>
          
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <ArrowDownLeft size={16} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase text-emerald-600">You Will Take</p>
              <p className="text-base font-black font-mono">₹ {totalTake.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-red-600 text-white rounded-lg">
              <ArrowUpRight size={16} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase text-red-600">You Will Give</p>
              <p className="text-base font-black font-mono">₹ {totalGive.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: New Entry Form */}
        <div className="erp-card p-6 h-fit sticky top-20">
          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button 
              onClick={() => setActiveTab('take')}
              className={clsx(
                "flex-1 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all",
                activeTab === 'take' 
                  ? "bg-white text-emerald-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              You Will Take (₹)
            </button>
            <button 
              onClick={() => setActiveTab('give')}
              className={clsx(
                "flex-1 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all",
                activeTab === 'give' 
                  ? "bg-white text-red-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              You Will Give (₹)
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="erp-label">Customer / Party Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="erp-input pl-10 font-bold"
                  placeholder="Enter Party Name"
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
                  onChange={(e) => setMobile(e.target.value)}
                  className="erp-input pl-10 font-bold"
                  placeholder="10-digit number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="erp-label">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="erp-input font-bold"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="erp-label">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)}
                  className="erp-input font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="erp-label">Notes / Bill Reference</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="erp-input h-20 resize-none text-xs font-medium"
                placeholder="Optional notes or details..."
              ></textarea>
            </div>

            <button 
              onClick={addEntry}
              className={clsx(
                "w-full text-white py-3.5 px-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-md active:scale-95",
                activeTab === 'take' 
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-950/20" 
                  : "bg-red-600 hover:bg-red-700 shadow-red-950/20"
              )}
            >
              Save to {activeTab === 'take' ? 'Receivable' : 'Payable'}
            </button>
          </div>
        </div>

        {/* Right Column: Ledger List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="erp-card overflow-hidden">
            {/* Search Toolbar */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ledger by name or mobile number..." 
                className="bg-transparent outline-none font-bold text-xs sm:text-sm w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-bold italic text-sm">
                  No records found in {activeTab === 'take' ? 'Receivable' : 'Payable'} ledger.
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={clsx(
                        "w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner shrink-0",
                        entry.type === 'take' ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
                      )}>
                        {entry.name ? entry.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-sm uppercase leading-none truncate">
                          {entry.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold mt-1">
                          <span>{entry.mobile || 'No Mobile'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Calendar size={11}/> {entry.createdAt}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-slate-500 mt-1.5 font-medium italic">
                            "{entry.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <p className={clsx(
                          "text-base sm:text-lg font-black font-mono tracking-tight",
                          entry.type === 'take' ? "text-emerald-700" : "text-red-700"
                        )}>
                          ₹ {(entry.amount || 0).toLocaleString('en-IN')}
                        </p>
                        {entry.dueDate && (
                          <p className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider mt-0.5">
                            Due: {new Date(entry.dueDate).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => sendWhatsApp(entry)}
                          className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-200 shadow-sm"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button 
                          onClick={() => deleteEntry(entry.id)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-slate-200 shadow-sm"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
