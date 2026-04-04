"use client";

import React, { useState, useEffect } from 'react';
import { KhatabookService } from '@/lib/api';
import { KhatabookEntry } from '@/types';
import { Plus, Trash2, Search, MessageCircle, Calendar, ArrowUpRight, ArrowDownLeft, User, Phone, Award } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { toast } from 'sonner';

export default function KhatabookPage() {
  const [entries, setEntries] = useState<KhatabookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'take' | 'give'>('take');
  
  useEffect(() => {
    KhatabookService.getAll().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);
  
  // Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const addEntry = async () => {
    if (!name || !amount) {
      toast.error('Name and Amount are required');
      return;
    }
    const newEntry: Partial<KhatabookEntry> = {
      name,
      mobile,
      amount: Number(amount),
      type: activeTab,
      dueDate,
      notes,
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
      toast.success('Entry added to Khatabook');
    } catch (error) {
      toast.error('Failed to add entry');
    }
  };

  const deleteEntry = (id: string) => {
    toast('Delete this entry?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await KhatabookService.delete(id);
            setEntries(entries.filter(e => e.id !== id));
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
      toast.error('Mobile number not available');
      return;
    }
    
    let message = "";
    if (entry.type === 'take') {
      message = `Hello ${entry.name}, this is a reminder from Bhumika Tiles regarding a pending payment of ₹${entry.amount}. Please settle it by ${entry.dueDate || 'earliest'}. Thank you!`;
    } else {
      message = `Hello ${entry.name}, this is regarding the payment of ₹${entry.amount} that we owe you. We plan to settle it by ${entry.dueDate || 'soon'}. Thank you for your patience!`;
    }
    
    const url = `https://wa.me/91${entry.mobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success('WhatsApp opened');
  };

  const filteredEntries = entries.filter(e => 
    e.type === activeTab && 
    (e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.mobile.includes(searchQuery))
  );

  const totalTake = entries.filter(e => e.type === 'take').reduce((sum, e) => sum + e.amount, 0);
  const totalGive = entries.filter(e => e.type === 'give').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tighter">Khatabook</h1>
          <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">Manage your Credit & Debit</p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/thekedars" className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-3 hover:border-emerald-600 transition-all shadow-sm group">
            <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-lg transition-colors">
              <Award size={20} />
            </div>
            <span className="font-black text-[10px] uppercase text-slate-500 tracking-widest group-hover:text-emerald-600">Thekedar Accounts</span>
          </Link>
          
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200">
              <ArrowDownLeft size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">You will Take</p>
              <p className="text-xl font-black text-emerald-600">₹ {totalTake.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-red-500 text-white rounded-xl shadow-lg shadow-red-200">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">You will Give</p>
              <p className="text-xl font-black text-red-600">₹ {totalGive.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit space-y-6">
          <div className="flex p-1 bg-gray-100 rounded-2xl">
            <button 
              onClick={() => setActiveTab('take')}
              className={clsx(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'take' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              You will Take
            </button>
            <button 
              onClick={() => setActiveTab('give')}
              className={clsx(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'give' ? "bg-white text-red-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              You will Give
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="erp-label">Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="erp-input pl-12 font-bold"
                  placeholder="Enter Name"
                />
              </div>
            </div>
            
            <div>
              <label className="erp-label">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" value={mobile} onChange={(e) => setMobile(e.target.value)}
                  className="erp-input pl-12 font-bold"
                  placeholder="10-digit number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="erp-label">Amount (₹)</label>
                <input 
                  type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="erp-input font-bold"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="erp-label">Due Date</label>
                <input 
                  type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="erp-input font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="erp-label">Notes</label>
              <textarea 
                value={notes} onChange={(e) => setNotes(e.target.value)}
                className="erp-input h-24 resize-none text-sm font-medium"
                placeholder="Optional notes..."
              ></textarea>
            </div>

            <button 
              onClick={addEntry}
              className={clsx(
                "w-full text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-all shadow-xl active:scale-95 mt-4",
                activeTab === 'take' ? "bg-emerald-500 shadow-emerald-100" : "bg-red-500 shadow-red-100"
              )}
            >
              Add Entry
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
              <Search size={20} className="text-gray-400" />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or mobile..." 
                className="bg-transparent outline-none font-bold text-sm w-full"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filteredEntries.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <User size={32} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold italic">No entries found in this category.</p>
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="p-6 hover:bg-gray-50/50 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                        entry.type === 'take' ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                      )}>
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-secondary text-base uppercase leading-none mb-1">{entry.name}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                          <span>{entry.mobile || 'No Mobile'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar size={10}/> {entry.createdAt}</span>
                        </div>
                        {entry.notes && <p className="text-xs text-slate-400 mt-2 font-medium italic">"{entry.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-right">
                      <div>
                        <p className={clsx(
                          "text-xl font-black tracking-tighter",
                          entry.type === 'take' ? "text-emerald-600" : "text-red-600"
                        )}>
                          ₹ {(entry.amount || 0).toLocaleString('en-IN')}
                        </p>
                        {entry.dueDate && (
                          <p className="text-[9px] font-black uppercase text-orange-400 tracking-widest mt-1">
                            Due: {new Date(entry.dueDate).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => sendWhatsApp(entry)}
                          className="p-3 bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button 
                          onClick={() => deleteEntry(entry.id)}
                          className="p-3 bg-gray-50 text-gray-300 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
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
