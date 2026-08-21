"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { EstimateService, SettingsService } from '@/lib/api';
import { Estimate } from '@/types';
import { 
  Eye, 
  Printer, 
  Trash2, 
  TrendingUp, 
  User, 
  Search, 
  Filter, 
  FileText, 
  X, 
  MessageCircle, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  Receipt,
  Calendar,
  Wallet,
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { numberToWords } from '@/lib/utils';
import { numberToMarathiWords, translateMaterialToMarathi } from '@/lib/marathi';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import Image from 'next/image';

export default function HistoryPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due'>('all');
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [shareEstimate, setShareEstimate] = useState<Estimate | null>(null);
  const [shopSettings, setShopSettings] = useState({
    shopName: 'Bhumika Tiles & Building Material',
    managerName: 'Rohit Chavan',
    phone: '8010060992',
    location: 'Parola, Dist. Jalgaon'
  });

  useEffect(() => {
    Promise.all([
      EstimateService.getAll(),
      SettingsService.get().catch(() => null)
    ]).then(([estData, settingsData]) => {
      setEstimates(estData || []);
      if (settingsData) setShopSettings(settingsData);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load bill history');
      setLoading(false);
    });
  }, []);

  const deleteEstimate = (id: string) => {
    toast('Delete this estimate permanently?', {
      description: 'This record will be permanently deleted from database archive.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await EstimateService.delete(id);
            setEstimates(prev => prev.filter(est => est.id !== id));
            if (selectedEstimate?.id === id) setSelectedEstimate(null);
            toast.success('Estimate deleted');
          } catch (error) {
            toast.error('Failed to delete estimate');
          }
        },
      },
    });
  };

  const filteredEstimates = useMemo(() => {
    return estimates.filter(est => {
      const matchQuery = 
        (est.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (est.mobileNumber || '').includes(searchQuery) ||
        (est.estNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (est.village || '').toLowerCase().includes(searchQuery.toLowerCase());

      const isDue = (est.balance || 0) > 0;
      if (statusFilter === 'paid') return matchQuery && !isDue;
      if (statusFilter === 'due') return matchQuery && isDue;
      return matchQuery;
    });
  }, [estimates, searchQuery, statusFilter]);

  const totalArchiveValue = estimates.reduce((sum, e) => sum + (e.grandTotal || 0), 0);
  const totalProfit = estimates.reduce((sum, e) => sum + ((e.grandTotal || 0) - (e.totalCost || 0)), 0);
  const totalUnpaid = estimates.reduce((sum, e) => sum + (e.balance || 0), 0);

  const handleWhatsApp = (est: Estimate) => {
    setShareEstimate(est);
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Bill History...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Estimate & Bill Archive
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Search, preview, print, and track all customer billing records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/80 text-xs font-bold">
            <span className="text-[10px] text-emerald-600 block uppercase font-extrabold">Total Billed</span>
            <span className="text-base font-black font-mono">₹ {totalArchiveValue.toLocaleString('en-IN')}</span>
          </div>
          <div className="px-4 py-2.5 bg-red-50 text-red-800 rounded-xl border border-red-200/80 text-xs font-bold">
            <span className="text-[10px] text-red-600 block uppercase font-extrabold">Total Unpaid</span>
            <span className="text-base font-black font-mono">₹ {totalUnpaid.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search by customer, bill no, phone, village..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          {[
            { id: 'all', label: `All Bills (${estimates.length})` },
            { id: 'paid', label: `Full Paid` },
            { id: 'due', label: `Balance Due` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all ${
                statusFilter === tab.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Table Card */}
      <div className="erp-card no-print">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date / Est No</th>
                <th>Customer Information</th>
                <th className="text-right">Total Bill</th>
                <th className="text-right">Profit Est.</th>
                <th className="text-center">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEstimates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-400 font-bold italic text-sm">
                    No matching estimates found in archive.
                  </td>
                </tr>
              ) : (
                [...filteredEstimates].reverse().map((est) => {
                  const profit = (est.grandTotal || 0) - (est.totalCost || 0);
                  const isDue = (est.balance || 0) > 0;
                  return (
                    <tr key={est.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td>
                        <div className="font-extrabold text-slate-800 text-xs">{est.date}</div>
                        <div className="text-[10px] font-mono font-extrabold text-emerald-600 uppercase mt-0.5 tracking-tight">
                          {est.estNo}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            {est.customerName ? est.customerName.charAt(0) : 'W'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs uppercase">{est.customerName || 'Walk-in Customer'}</div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {est.mobileNumber || ''} {est.village ? `• ${est.village}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="font-black text-slate-900 text-xs sm:text-sm font-mono">
                          ₹ {(est.grandTotal || 0).toLocaleString('en-IN')}
                        </div>
                        {est.paidAmount > 0 && (
                          <div className="text-[9px] text-slate-400 font-semibold">Paid: ₹{est.paidAmount}</div>
                        )}
                      </td>
                      <td className="text-right">
                        <span className="text-[10px] font-extrabold text-emerald-600 font-mono">
                          + ₹ {profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                          isDue 
                            ? 'bg-red-50 text-red-600 border-red-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isDue ? `Due ₹${est.balance}` : 'Full Paid'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedEstimate(est)}
                            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                            title="Preview Full Bill Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            onClick={() => handleWhatsApp(est)}
                            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                            title="WhatsApp Share"
                          >
                            <MessageCircle size={15} />
                          </button>
                          <button 
                            onClick={() => deleteEstimate(est.id)} 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                            title="Delete Bill"
                          >
                            <Trash2 size={15} />
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

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedEstimate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Receipt size={18} className="text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Estimate Invoice Details
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {selectedEstimate.estNo} • {selectedEstimate.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleWhatsApp(selectedEstimate)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle size={13} /> WhatsApp
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Printer size={13} /> Print
                  </button>
                  <button
                    onClick={() => setSelectedEstimate(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Customer Info Card */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Customer</span>
                    <p className="text-xs font-black text-slate-800 uppercase mt-0.5">{selectedEstimate.customerName || 'Walk-in'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Contact / Village</span>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {selectedEstimate.mobileNumber || '-'} {selectedEstimate.village ? `(${selectedEstimate.village})` : ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Payment Status</span>
                    <p className={`text-xs font-black uppercase mt-0.5 ${selectedEstimate.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {selectedEstimate.balance > 0 ? `Pending Due: ₹${selectedEstimate.balance}` : 'Full Paid'}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-800 text-white uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 text-center w-8">#</th>
                        <th className="p-2.5 text-left">Description</th>
                        <th className="p-2.5 text-center">Size (LxW)</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-center">Sqft</th>
                        <th className="p-2.5 text-center">Rate</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedEstimate.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-800 uppercase">{item.particular}</td>
                          <td className="p-2.5 text-center">{!item.isExtra ? `${item.length} × ${item.width}` : '-'}</td>
                          <td className="p-2.5 text-center font-bold">{item.qty}</td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">{!item.isExtra ? (item.sqft || 0).toFixed(2) : '-'}</td>
                          <td className="p-2.5 text-center">₹{item.rate}</td>
                          <td className="p-2.5 text-right font-black">₹{(item.amount || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                      Total In Words
                    </span>
                    <p className="font-bold text-slate-800 uppercase leading-snug">
                      {numberToWords(selectedEstimate.grandTotal)} Rupees Only
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span className="font-mono">₹ {(selectedEstimate.subTotal || 0).toFixed(2)}</span>
                    </div>
                    {selectedEstimate.gstType !== 'none' && (
                      <div className="flex justify-between text-slate-400">
                        <span>GST Mode ({selectedEstimate.gstType}):</span>
                        <span className="font-mono">{selectedEstimate.gstRate || 18}%</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Discount:</span>
                      <span className="font-mono">- ₹ {(selectedEstimate.discount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-emerald-400 pt-2 border-t border-white/10">
                      <span>Grand Total:</span>
                      <span className="font-mono">₹ {selectedEstimate.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs text-red-400">
                      <span>Balance Due:</span>
                      <span className="font-mono">₹ {selectedEstimate.balance.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Invoice Image Modal */}
      {shareEstimate && (
        <WhatsAppShareModal
          isOpen={!!shareEstimate}
          onClose={() => setShareEstimate(null)}
          type="bill"
          data={shareEstimate}
          shopSettings={shopSettings}
          phone={shareEstimate.mobileNumber}
          customerName={shareEstimate.customerName}
          title={`Share Bill ${shareEstimate.estNo} on WhatsApp`}
        />
      )}

      {/* Printable Estimate Invoice (A4 Half-Size / A5 Format - Ink Saver) */}
      {selectedEstimate && (
        <div className="hidden print:block invoice-container bg-white text-black">
          {/* Header */}
          <header className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 relative flex-shrink-0">
                <Image src="/logo.png" alt="Logo" width={44} height={44} className="object-contain" priority unoptimized />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase leading-tight tracking-tight text-black">
                  {shopSettings.shopName}
                </h1>
                <p className="font-bold text-[8.5px] uppercase tracking-wider text-black">
                  भूमिका टाईल्स, ग्रॅनाईट, प्लायवूड व बिल्डिंग मटेरिअल्स
                </p>
                <p className="text-[8px] font-bold text-black">
                  {shopSettings.location} (पारोळा) | मो.: {shopSettings.phone}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black uppercase tracking-wider text-black border-2 border-black bg-white px-2 py-0.5 rounded inline-block mb-1">
                ESTIMATE / अंदाज बिल
              </span>
              <div className="text-[8.5px] space-y-0.5 font-bold text-black">
                <p className="font-mono">बिल नं: <span className="font-black">{selectedEstimate.estNo}</span></p>
                <p>तारीख: {selectedEstimate.date}</p>
              </div>
            </div>
          </header>

          {/* Customer & Payment Meta */}
          <section className="mb-2 grid grid-cols-2 gap-2 border border-black p-2 rounded-lg bg-white text-[9px] text-black">
            <div>
              <p className="text-[7.5px] uppercase font-black text-black tracking-wider">ग्राहकाचे नाव (Billed To):</p>
              <p className="text-xs font-black uppercase text-black">{selectedEstimate.customerName || 'Walk-in Customer (रोख ग्राहक)'}</p>
              <div className="text-[8.5px] font-bold text-black mt-0.5">
                <span>गाव/पत्ता: {selectedEstimate.village || 'Local'}</span> • <span>मोबाईल: {selectedEstimate.mobileNumber || 'N/A'}</span>
              </div>
            </div>
            <div className="text-right flex flex-col justify-center">
              <p className="font-black uppercase text-black text-[10px]">
                {selectedEstimate.balance > 0 ? `बाकी रक्कम: ₹${selectedEstimate.balance.toLocaleString('en-IN')}` : 'पूर्ण जमा (FULL PAID)'}
              </p>
              <p className="text-[8px] font-bold text-black">Parola (पारोळा, महाराष्ट्र)</p>
            </div>
          </section>

          {/* Goods Table */}
          <table className="w-full table-fixed text-[9px] border-collapse border border-black mb-2 bg-white text-black">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[38%]" />
              <col className="w-[18%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="bg-white border-b-2 border-black text-[8.5px]">
                <th className="p-1 border-r border-black text-center font-black uppercase">#</th>
                <th className="p-1 pl-2 border-r border-black text-left font-black uppercase">मालाचा तपशील (Description)</th>
                <th className="p-1 border-r border-black text-center font-black uppercase">साईझ (LxW)</th>
                <th className="p-1 border-r border-black text-center font-black uppercase">नग (Qty)</th>
                <th className="p-1 border-r border-black text-center font-black uppercase">फूट (Sqft)</th>
                <th className="p-1 pr-1.5 border-r border-black text-right font-black uppercase">दर (Rate ₹)</th>
                <th className="p-1 pr-1.5 text-right font-black uppercase w-20">रक्कम (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y border-black">
              {(selectedEstimate.items || []).map((item, index) => {
                const marathiName = translateMaterialToMarathi(item.particular);
                return (
                  <tr key={item.id || index} className="text-black">
                    <td className="p-1 border-r border-black text-center font-bold text-[8.5px]">{index + 1}</td>
                    <td className="p-1 pl-2 border-r border-black font-black uppercase text-[8.5px] truncate">
                      <span>{item.particular}</span>
                      {marathiName && <span className="ml-1 text-[7.5px] font-bold">({marathiName})</span>}
                      {item.isExtra && <span className="ml-1 text-[7px] lowercase">(नग)</span>}
                    </td>
                    <td className="p-1 border-r border-black text-center font-bold text-[8.5px] font-mono">
                      {!item.isExtra && item.length && item.width ? `${item.length}" × ${item.width}"` : '-'}
                    </td>
                    <td className="p-1 border-r border-black text-center font-bold text-[8.5px]">{item.qty}</td>
                    <td className="p-1 border-r border-black text-center font-black text-[8.5px]">
                      {!item.isExtra && item.sqft ? item.sqft.toFixed(2) : '-'}
                    </td>
                    <td className="p-1 pr-1.5 border-r border-black text-right font-bold text-[8.5px]">₹{item.rate}</td>
                    <td className="p-1 pr-1.5 text-right font-black text-[8.5px]">₹{(item.amount || 0).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals & Words */}
          <div className="flex justify-between items-start gap-3 text-black">
            <div className="flex-1">
              <div className="border border-black p-1.5 rounded-lg mb-1.5 bg-white text-[8.5px]">
                <span className="text-[7.5px] font-black uppercase block mb-0.5 text-black">
                  अक्षरी एकूण रक्कम (Amount in Words):
                </span>
                <p className="text-[9.5px] font-black text-black leading-tight">
                  {numberToMarathiWords(selectedEstimate.grandTotal)}
                </p>
                <p className="text-[7.5px] font-bold text-black uppercase mt-0.5">
                  ({numberToWords(selectedEstimate.grandTotal)} Rupees Only)
                </p>
              </div>
              <div className="text-[7px] font-bold uppercase leading-tight italic px-1 border-l border-black text-black">
                नियम: १. विकलेला माल परत घेतला जाणार नाही. २. डिलिव्हरीवेळी माल तपासावा.
              </div>
            </div>

            <div className="w-56 border border-black rounded-lg overflow-hidden text-[8.5px] bg-white text-black">
              <div className="p-1 border-b border-black flex justify-between font-bold text-black uppercase">
                <span>निव्वळ बेरीज (Subtotal)</span>
                <span>₹ {(selectedEstimate.subTotal || 0).toFixed(2)}</span>
              </div>
              {selectedEstimate.gstType !== 'none' && (
                <div className="p-1 border-b border-black flex justify-between font-bold text-black uppercase">
                  <span>जीएसटी कर (GST {selectedEstimate.gstRate || 18}%)</span>
                  <span>₹ {((selectedEstimate.subTotal - selectedEstimate.discount) * ((selectedEstimate.gstRate || 18) / 100)).toFixed(2)}</span>
                </div>
              )}
              {selectedEstimate.discount > 0 && (
                <div className="p-1 border-b border-black flex justify-between font-bold text-black uppercase">
                  <span>सूट (Discount)</span>
                  <span>- ₹ {selectedEstimate.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="p-1 border-t-2 border-b border-black bg-white text-black flex justify-between font-black uppercase tracking-wider text-[9px]">
                <span>अंतिम एकूण (Total)</span>
                <span>₹ {selectedEstimate.grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-1 flex justify-between font-black uppercase bg-white text-black">
                <span>बाकी रक्कम (Balance)</span>
                <span>
                  ₹ {selectedEstimate.balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-5 flex justify-between px-4 text-black">
            <div className="text-center w-36">
              <div className="border-t border-black pt-1 font-black text-[8px] uppercase tracking-wider">
                ग्राहकाची सही (Customer)
              </div>
            </div>
            <div className="text-center w-36">
              <div className="border-t border-black pt-1 font-black text-[8px] uppercase tracking-wider">
                अधिकृत सही (Signatory)
              </div>
              <p className="text-[7px] font-bold italic text-black">({shopSettings.shopName})</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
