"use client";

import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Estimate } from '@/types';
import { Eye, Printer, Trash2, TrendingUp, User } from 'lucide-react';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [estimates, setEstimates] = useLocalStorage<Estimate[]>('bhumi_estimates', []);

  const deleteEstimate = (id: string) => {
    toast('Delete this estimate permanently?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: () => {
          setEstimates(estimates.filter(est => est.id !== id));
          toast.success('Estimate deleted');
        },
      },
    });
  };

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tighter">Estimate History</h1>
          <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">Archive of all generated bills</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:scale-105">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Archive Value</p>
            <p className="text-xl font-black text-secondary">₹ {estimates.reduce((sum, e) => sum + (e.grandTotal || 0), 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-6 font-black text-gray-400 uppercase text-[10px] tracking-[0.2em]">Date / Est No</th>
              <th className="p-6 font-black text-gray-400 uppercase text-[10px] tracking-[0.2em]">Customer Details</th>
              <th className="p-6 font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] text-right">Total Bill</th>
              <th className="p-6 font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] text-center">Status</th>
              <th className="p-6 font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {estimates.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-300 font-bold italic text-sm uppercase">No estimates found in archive.</td>
              </tr>
            ) : (
              [...estimates].reverse().map((est) => {
                const profit = (est.grandTotal || 0) - (est.totalCost || 0);
                return (
                  <tr key={est.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="font-black text-secondary uppercase text-xs">{est.date}</div>
                      <div className="text-[10px] font-mono font-bold text-emerald-600 uppercase mt-1 tracking-tighter">{est.estNo}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400 font-black text-xs uppercase group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          {est.customerName?.charAt(0) || 'W'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 uppercase text-xs">{est.customerName || 'Walk-in'}</div>
                          <div className="text-[10px] text-slate-400 font-bold tracking-tight">{est.mobileNumber || 'No Mobile'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="font-black text-slate-800 text-sm">₹ {(est.grandTotal || 0).toLocaleString('en-IN')}</div>
                      <div className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">Profit: ₹ {(profit || 0).toFixed(2)}</div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${est.balance > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {est.balance > 0 ? `Unpaid: ₹${est.balance}` : 'Full Paid'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2.5 text-slate-400 hover:text-emerald-600 transition-all border border-slate-100 rounded hover:shadow-md bg-white">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => window.print()} className="p-2.5 text-slate-400 hover:text-slate-800 transition-all border border-slate-100 rounded hover:shadow-md bg-white">
                          <Printer size={18} />
                        </button>
                        <button onClick={() => deleteEstimate(est.id)} className="p-2.5 text-slate-400 hover:text-red-500 transition-all border border-slate-100 rounded hover:shadow-md bg-white">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
