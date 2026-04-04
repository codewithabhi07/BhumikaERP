"use client";

import React, { useState, useEffect } from 'react';
import { CustomerService, EstimateService } from '@/lib/api';
import { Estimate, Customer } from '@/types';
import { Printer, User, MapPin, Phone, History, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { numberToWords } from '@/lib/utils';

export default function ThekedarStatementPage() {
  const params = useParams();
  const id = params.id as string;

  const [thekedar, setThekedar] = useState<Customer | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      CustomerService.getById(id),
      EstimateService.getAll()
    ]).then(([customerData, estimatesData]) => {
      setThekedar(customerData);
      setEstimates(estimatesData);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  const thekedarEstimates = estimates.filter(e => e.mobileNumber === thekedar?.mobile).reverse();

  if (loading) return <div className="p-10 text-center font-bold text-slate-400 italic">Loading Statement...</div>;
  if (!thekedar) return <div className="p-10 text-center font-bold text-slate-400 italic">Thekedar Account not found.</div>;

  const totalBilled = thekedarEstimates.reduce((sum, e) => sum + (e.grandTotal || 0), 0);
  const totalPaid = thekedarEstimates.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
  const remainingBalance = totalBilled - totalPaid;

  return (
    <div className="py-4 space-y-8">
      <div className="flex justify-between items-center no-print">
        <Link href="/thekedars" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors">
          <ArrowLeft size={18} /> Back to Accounts
        </Link>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={18} /> Print Statement
        </button>
      </div>

      <div className="invoice-container bg-white p-10 border border-slate-200 shadow-xl rounded-[2.5rem] relative overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-xl font-black uppercase leading-none mb-1">Bhumika Tiles</h1>
              <p className="font-bold text-xs uppercase tracking-widest text-slate-500">Contractor Ledger Statement</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statement Date</p>
            <p className="font-black text-slate-800">{new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </header>

        {/* Thekedar Info Card */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl mb-10 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-600 rounded-full blur-3xl opacity-20"></div>
          <div className="space-y-2 relative z-10">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Contractor Details</p>
            <h2 className="text-3xl font-black tracking-tight uppercase">{thekedar.name}</h2>
            <div className="flex gap-6 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={14}/> {thekedar.village}</span>
              <span className="flex items-center gap-2"><Phone size={14}/> {thekedar.mobile}</span>
            </div>
          </div>
          <div className="text-right relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Outstanding</p>
            <p className="text-4xl font-black text-white tracking-tighter">₹ {remainingBalance.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-6 mb-10 no-print">
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Billed</p>
            <p className="text-xl font-black text-slate-800">₹ {totalBilled.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Received</p>
            <p className="text-xl font-black text-emerald-700">₹ {totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Pending Balance</p>
            <p className="text-xl font-black text-red-700">₹ {remainingBalance.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Table */}
        <div className="erp-card">
          <div className="erp-card-header !bg-slate-800 !border-slate-800">
            <span className="text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <History size={14} /> Transaction History
            </span>
          </div>
          <table className="erp-table">
            <thead>
              <tr className="bg-slate-900">
                <th className="text-white">Date</th>
                <th className="text-white">Bill Number</th>
                <th className="text-white text-right">Bill Amt</th>
                <th className="text-white text-right">Paid Amt</th>
                <th className="text-white text-right text-red-400">Balance</th>
              </tr>
            </thead>
            <tbody>
              {thekedarEstimates.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">No transactions found for this account.</td></tr>
              ) : (
                thekedarEstimates.map((est) => (
                  <tr key={est.id}>
                    <td className="font-bold">{est.date}</td>
                    <td className="font-mono text-[11px] font-bold text-emerald-600 uppercase">{est.estNo}</td>
                    <td className="text-right font-bold text-slate-800">₹ {est.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="text-right font-bold text-emerald-600">₹ {est.paidAmount.toLocaleString('en-IN')}</td>
                    <td className="text-right font-black text-red-600">₹ {est.balance.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
            {thekedarEstimates.length > 0 && (
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan={2} className="p-4 text-right font-black uppercase text-xs tracking-widest">Total Summary:</td>
                  <td className="p-4 text-right font-black text-slate-800">₹ {totalBilled.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-right font-black text-emerald-600">₹ {totalPaid.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-right font-black text-red-600 bg-red-50">₹ {remainingBalance.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8 flex justify-between items-end">
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 w-fit">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Outstanding in Words</span>
              <p className="text-xs font-black uppercase text-slate-800 leading-none">{numberToWords(remainingBalance)} Rupees Only</p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic">* This is a consolidated statement of accounts for Bhumika Tiles.</p>
          </div>
          <div className="text-center w-48 border-t-2 border-slate-900 pt-3 font-black text-[10px] uppercase text-slate-900 tracking-widest">
            Authorized Signature
          </div>
        </div>
      </div>
    </div>
  );
}
