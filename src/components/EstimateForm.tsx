"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Printer, Save, Search, Calculator, User, Phone, Package, Receipt } from 'lucide-react';
import { calculateThreeTableSqFt, numberToWords } from '@/lib/utils';
import { EstimateItem, Estimate, Product } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Image from 'next/image';

export default function EstimateForm() {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [items, setItems] = useState<EstimateItem[]>([
    { id: '1', particular: '', length: 0, width: 0, qty: 1, sqft: 0, rate: 0, costPrice: 0, amount: 0 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [gstType, setGstType] = useState<'none' | 'sgst_cgst' | 'igst'>('none');
  const [gstRate, setGstRate] = useState(18);
  const [estNo, setEstNo] = useState('');
  const [date, setDate] = useState('');

  const [estimates, setEstimates] = useLocalStorage<Estimate[]>('bhumi_estimates', []);
  const [products] = useLocalStorage<Product[]>('bhumi_products', []);
  const [showProductList, setShowProductList] = useState<{index: number, visible: boolean}>({ index: -1, visible: false });

  useEffect(() => {
    const now = new Date();
    setDate(now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    setEstNo(`EST-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  }, []);

  const addRow = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), particular: '', length: 0, width: 0, qty: 1, sqft: 0, rate: 0, costPrice: 0, amount: 0 }]);
  };

  const deleteRow = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof EstimateItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (['length', 'width', 'qty'].includes(field)) {
          updated.sqft = calculateThreeTableSqFt(Number(updated.length), Number(updated.width), Number(updated.qty));
        }
        updated.amount = Number((updated.sqft * updated.rate).toFixed(2));
        return updated;
      }
      return item;
    }));
  };

  const selectProduct = (index: number, product: Product) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], particular: product.name, rate: product.defaultRate, costPrice: product.costPrice || 0 };
    newItems[index].amount = Number((newItems[index].sqft * newItems[index].rate).toFixed(2));
    setItems(newItems);
    setShowProductList({ index: -1, visible: false });
  };

  const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalCost = items.reduce((sum, item) => sum + ((item.sqft || 0) * (item.costPrice || 0)), 0);
  const gstTotal = gstType === 'none' ? 0 : (subTotal * gstRate) / 100;
  const grandTotal = Math.round(subTotal + gstTotal - discount);
  const balance = grandTotal - paidAmount;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 no-print">
        <div className="xl:col-span-3 erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title flex items-center gap-2">
              <Receipt size={16} className="text-emerald-600" />
              Bill Entry Details
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="erp-label">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="erp-input pl-10" placeholder="Full Name" />
                </div>
              </div>
              <div>
                <label className="erp-label">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input type="text" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="erp-input pl-10" placeholder="10 Digits" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="erp-label">Bill No</label>
                  <input type="text" value={estNo} readOnly className="erp-input bg-slate-50 font-mono text-[11px]" />
                </div>
                <div>
                  <label className="erp-label">Date</label>
                  <input type="text" value={date} readOnly className="erp-input bg-slate-50 font-mono text-[11px]" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[10px] uppercase tracking-wider">
                    <th className="p-3 text-center w-10">#</th>
                    <th className="p-3 text-left">Item Particulars</th>
                    <th className="p-3 text-center w-28">Size (LxW)</th>
                    <th className="p-3 text-center w-16">Qty</th>
                    <th className="p-3 text-center w-20">Sqft</th>
                    <th className="p-3 text-center w-24">Rate</th>
                    <th className="p-3 text-right w-28">Amount</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group">
                      <td className="p-2 text-center text-slate-400 font-bold text-xs">{index + 1}</td>
                      <td className="p-2 relative">
                        <input 
                          list="stock-products"
                          className="erp-input !border-transparent hover:!border-slate-200 focus:!border-emerald-500 font-bold"
                          value={item.particular}
                          onChange={e => { updateItem(item.id, 'particular', e.target.value); setShowProductList({ index, visible: true }); }}
                          onFocus={() => setShowProductList({ index, visible: true })}
                          placeholder="Type or Search..."
                        />
                        <datalist id="stock-products">
                          {products.map(p => <option key={p.id} value={p.name} />)}
                        </datalist>
                        {showProductList.index === index && showProductList.visible && (
                          <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-xl rounded-lg border border-slate-200 z-50 max-h-48 overflow-y-auto">
                            {products.filter(p => p.name.toLowerCase().includes(item.particular.toLowerCase())).map(p => (
                              <div key={p.id} onClick={() => selectProduct(index, p)} className="p-3 hover:bg-emerald-600 hover:text-white cursor-pointer flex justify-between items-center text-xs border-b border-slate-100 last:border-none">
                                <span className="font-bold">{p.name}</span>
                                <span className="font-mono">₹{p.defaultRate}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <input type="number" className="erp-input !p-1 text-center" value={item.length || ''} onChange={e => updateItem(item.id, 'length', e.target.value)} />
                          <span className="text-slate-300 font-bold">×</span>
                          <input type="number" className="erp-input !p-1 text-center" value={item.width || ''} onChange={e => updateItem(item.id, 'width', e.target.value)} />
                        </div>
                      </td>
                      <td className="p-2"><input type="number" className="erp-input !p-1 text-center" value={item.qty || ''} onChange={e => updateItem(item.id, 'qty', e.target.value)} /></td>
                      <td className="p-2 text-center font-bold text-emerald-600">{(item.sqft || 0).toFixed(2)}</td>
                      <td className="p-2 text-center"><input type="number" className="erp-input !p-1 text-center font-bold" value={item.rate || ''} onChange={e => updateItem(item.id, 'rate', e.target.value)} /></td>
                      <td className="p-2 text-right font-black text-slate-800">₹{(item.amount || 0).toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => deleteRow(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addRow} className="mt-4 flex items-center gap-2 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest px-4 py-2 border border-dashed border-emerald-200 rounded bg-emerald-50/50">
              <Plus size={14} /> Add New Row (Enter)
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="erp-card p-6 bg-slate-800 text-white border-none shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
              <Calculator size={14} />
              Billing Summary
            </h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between"><span>Subtotal</span><span>₹ {(subTotal || 0).toFixed(2)}</span></div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold">GST Configuration</label>
                <select value={gstType} onChange={e => setGstType(e.target.value as any)} className="w-full bg-white/10 border border-white/10 rounded px-2 py-1.5 text-xs outline-none">
                  <option value="none" className="text-slate-800">None (Cash)</option>
                  <option value="sgst_cgst" className="text-slate-800">SGST + CGST (18%)</option>
                  <option value="igst" className="text-slate-800">IGST (18%)</option>
                </select>
              </div>
              <div className="flex justify-between group">
                <span className="text-slate-400">Discount (₹)</span>
                <input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} className="w-20 bg-transparent text-right outline-none border-b border-white/10 focus:border-emerald-500" />
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Grand Total</span>
                  <span className="text-2xl font-black tracking-tight">₹ {(grandTotal || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex justify-between group">
                <span className="text-slate-400">Paid Amt (₹)</span>
                <input type="number" value={paidAmount || ''} onChange={e => setPaidAmount(Number(e.target.value))} className="w-24 bg-transparent text-right outline-none border-b border-white/10 focus:border-emerald-500 font-bold text-emerald-400" />
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded flex justify-between items-center text-red-400">
                <span className="text-[10px] font-bold uppercase tracking-widest">Balance Due</span>
                <span className="text-lg font-black tracking-tight">₹ {(balance || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button onClick={() => window.print()} className="btn-primary w-full !text-xs !py-3 uppercase tracking-tighter">
                <Printer size={14} /> Print
              </button>
              <button onClick={() => {
                const estimate = { id: Math.random().toString(36).substr(2, 9), estNo, date, customerName, mobileNumber, items, subTotal, totalCost, discount, gstType, gstRate, grandTotal, paidAmount, balance };
                setEstimates([...estimates, estimate]);
                alert('Saved to ERP History');
              }} className="btn-secondary w-full !text-xs !py-3 uppercase tracking-tighter">
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:block invoice-container bg-white text-black min-h-screen">
        <header className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={64} height={64} className="object-contain" priority unoptimized />
            <div>
              <h1 className="text-xl font-black uppercase leading-none mb-1">Bhumika Plywood</h1>
              <p className="font-bold text-xs uppercase tracking-widest">Building Material & Plywood Shop</p>
              <p className="text-[9px] mt-1 font-medium">Parola, Dist. Jalgaon | Phone: 8010060992 | Manager: Rohit Chavan</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black uppercase tracking-widest mb-2">Estimate Bill</h2>
            <div className="text-[10px] space-y-0.5">
              <p>Est No: <strong>{estNo}</strong></p>
              <p>Date: <strong>{date}</strong></p>
            </div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-8 border border-black p-3 rounded">
          <div>
            <p className="text-[9px] uppercase font-bold text-gray-500 mb-1">Bill To:</p>
            <p className="text-sm font-black uppercase">{customerName || 'Walk-in Customer'}</p>
            <p className="text-[10px] font-bold mt-1">Mobile: {mobileNumber || 'N/A'}</p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="text-[10px] font-bold">Shop Location: Parola</p>
          </div>
        </section>

        <table className="w-full text-xs border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="p-2 border-r border-black w-8">#</th>
              <th className="p-2 border-r border-black text-left">Description of Goods</th>
              <th className="p-2 border-r border-black w-24">Size (LxW)</th>
              <th className="p-2 border-r border-black w-12">Qty</th>
              <th className="p-2 border-r border-black w-16">Sqft</th>
              <th className="p-2 border-r border-black w-20">Rate</th>
              <th className="p-2 text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-black">
                <td className="p-2 border-r border-black text-center">{index + 1}</td>
                <td className="p-2 border-r border-black font-bold uppercase">{item.particular}</td>
                <td className="p-2 border-r border-black text-center font-bold">{item.length} x {item.width}</td>
                <td className="p-2 border-r border-black text-center font-bold">{item.qty}</td>
                <td className="p-2 border-r border-black text-center font-black">{(item.sqft || 0).toFixed(2)}</td>
                <td className="p-2 border-r border-black text-center font-bold">{item.rate}</td>
                <td className="p-2 text-right font-black">₹{(item.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-start gap-10">
          <div className="flex-1">
            <div className="border border-black p-3 rounded mb-4">
              <span className="text-[8px] font-bold uppercase block mb-1">Amount in Words:</span>
              <p className="text-[10px] font-black uppercase leading-tight">{numberToWords(grandTotal)} Rupees Only</p>
            </div>
            <div className="text-[8px] font-bold uppercase leading-relaxed italic opacity-60">
              Note: 1. Prices subject to market change. 2. Goods once sold will not be returned. 3. This is an estimate only.
            </div>
          </div>
          <div className="w-64 border border-black rounded overflow-hidden">
            <div className="p-2 border-b border-black flex justify-between font-bold text-[10px]"><span>Subtotal</span><span>₹ {(subTotal || 0).toFixed(2)}</span></div>
            {gstType !== 'none' && <div className="p-2 border-b border-black flex justify-between font-bold text-[10px]"><span>GST (18%)</span><span>₹ {(gstTotal || 0).toFixed(2)}</span></div>}
            <div className="p-2 border-b border-black flex justify-between font-bold text-[10px]"><span>Discount</span><span>₹ {(discount || 0).toFixed(2)}</span></div>
            <div className="p-2 bg-gray-100 flex justify-between font-black text-xs border-b border-black uppercase tracking-tighter"><span>Grand Total</span><span>₹ {(grandTotal || 0).toLocaleString('en-IN')}</span></div>
            <div className="p-2 flex justify-between font-bold text-[10px] text-red-600 italic"><span>Balance Due</span><span>₹ {(balance || 0).toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div className="mt-16 flex justify-between px-10">
          <div className="text-center w-48"><div className="border-t border-black pt-2 font-black text-[9px] uppercase">Customer Signature</div></div>
          <div className="text-center w-48"><div className="border-t border-black pt-2 font-black text-[9px] uppercase">Auth. Signatory</div><p className="text-[8px] italic">(Bhumika Plywood)</p></div>
        </div>
      </div>
    </div>
  );
}
