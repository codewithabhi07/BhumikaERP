"use client";

import React, { useState, useEffect } from 'react';
import { CustomerService, EstimateService, SettingsService } from '@/lib/api';
import { Estimate, Customer } from '@/types';
import { Printer, User, MapPin, Phone, History, FileText, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { numberToWords } from '@/lib/utils';
import Image from 'next/image';

export default function ThekedarStatementPage() {
  const params = useParams();
  const id = params.id as string;

  const [thekedar, setThekedar] = useState<Customer | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopSettings, setShopSettings] = useState({
    shopName: 'Bhumika Tiles & Building Material',
    managerName: 'Rohit Chavan',
    phone: '8010060992',
    location: 'Parola, Dist. Jalgaon'
  });

  useEffect(() => {
    Promise.all([
      CustomerService.getById(id),
      EstimateService.getAll(),
      SettingsService.get().catch(() => null)
    ]).then(([customerData, estimatesData, settingsData]) => {
      setThekedar(customerData);
      setEstimates(estimatesData || []);
      if (settingsData) {
        setShopSettings({
          shopName: settingsData.shopName || 'Bhumika Tiles & Building Material',
          managerName: settingsData.managerName || 'Rohit Chavan',
          phone: settingsData.phone || '8010060992',
          location: settingsData.location || 'Parola, Dist. Jalgaon'
        });
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Statement...</p>
      </div>
    );
  }

  if (!thekedar) {
    return (
      <div className="py-16 text-center text-slate-400 font-bold italic space-y-4">
        <p>Contractor account not found in records.</p>
        <Link href="/thekedars" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Contractor Registry
        </Link>
      </div>
    );
  }

  const thekedarEstimates = estimates.filter(e => 
    e.mobileNumber === thekedar.mobile || 
    (thekedar.name && e.customerName && e.customerName.toLowerCase() === thekedar.name.toLowerCase())
  ).reverse();

  const totalBilled = thekedarEstimates.reduce((sum, e) => sum + (e.grandTotal || 0), 0);
  const totalPaid = thekedarEstimates.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
  const remainingBalance = totalBilled - totalPaid;

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex justify-between items-center no-print bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <Link 
          href="/thekedars" 
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-colors"
        >
          <ArrowLeft size={16} /> Back to Contractor List
        </Link>
        <button 
          onClick={() => window.print()} 
          className="btn-primary flex items-center gap-2"
        >
          <Printer size={15} /> Print Statement
        </button>
      </div>

      {/* Main Statement Document */}
      <div className="invoice-container bg-white p-6 sm:p-10 border border-slate-200 shadow-xl rounded-3xl relative overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center border-b-2 border-slate-900 pb-5 mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 relative">
              <Image src="/logo.png" alt="Logo" width={56} height={56} className="object-contain" priority unoptimized />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase leading-none mb-1 tracking-tight">
                {shopSettings.shopName}
              </h1>
              <p className="font-extrabold text-[10px] uppercase tracking-widest text-slate-500">
                Official Contractor Ledger Statement
              </p>
              <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                {shopSettings.location} • Mobile: {shopSettings.phone}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Statement Date</p>
            <p className="font-black text-slate-800 text-sm">{new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </header>

        {/* Thekedar Info Hero Card */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-36 h-36 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em]">
              Contractor Ledger
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              {thekedar.name}
            </h2>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-1">
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-emerald-400"/> {thekedar.village || 'Local'}</span>
              <span className="flex items-center gap-1.5"><Phone size={13} className="text-emerald-400"/> {thekedar.mobile}</span>
            </div>
          </div>

          <div className="text-left sm:text-right relative z-10 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 w-full sm:w-auto">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
              Outstanding Balance Due
            </p>
            <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              ₹ {remainingBalance.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Billed</p>
            <p className="text-lg sm:text-xl font-black text-slate-800 font-mono">₹ {totalBilled.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4 sm:p-5 rounded-2xl">
            <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest mb-1">Total Received</p>
            <p className="text-lg sm:text-xl font-black text-emerald-700 font-mono">₹ {totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 sm:p-5 rounded-2xl">
            <p className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest mb-1">Pending Balance</p>
            <p className="text-lg sm:text-xl font-black text-red-700 font-mono">₹ {remainingBalance.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8">
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
              <History size={14} className="text-emerald-400" />
              Itemized Billing History
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              {thekedarEstimates.length} Transactions
            </span>
          </div>

          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 text-[10px] uppercase tracking-wider">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Bill Number</th>
                <th className="p-3 text-right">Bill Total (₹)</th>
                <th className="p-3 text-right">Paid (₹)</th>
                <th className="p-3 text-right">Balance Due (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {thekedarEstimates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 italic">
                    No transactions recorded for this contractor yet.
                  </td>
                </tr>
              ) : (
                thekedarEstimates.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-slate-800">{est.date}</td>
                    <td className="p-3 font-mono font-extrabold text-emerald-700 uppercase text-xs">
                      {est.estNo}
                    </td>
                    <td className="p-3 text-right font-black text-slate-800 font-mono">
                      ₹ {est.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-black text-emerald-700 font-mono">
                      ₹ {est.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-black text-red-600 font-mono">
                      ₹ {est.balance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {thekedarEstimates.length > 0 && (
              <tfoot className="bg-slate-100 font-black text-xs">
                <tr>
                  <td colSpan={2} className="p-3.5 text-right uppercase tracking-wider">
                    Total Summary:
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-900">
                    ₹ {totalBilled.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right font-mono text-emerald-700">
                    ₹ {totalPaid.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right font-mono text-red-700 bg-red-100/60">
                    ₹ {remainingBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer & Signatures */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-2">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">
                Outstanding Amount in Words
              </span>
              <p className="text-xs font-black uppercase text-slate-800 leading-snug">
                {numberToWords(remainingBalance)} Rupees Only
              </p>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Consolidated ledger statement issued by {shopSettings.shopName}.
            </p>
          </div>

          <div className="text-center w-52 pt-6 border-t-2 border-slate-900 font-black text-[10px] uppercase text-slate-900 tracking-widest self-end">
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}
