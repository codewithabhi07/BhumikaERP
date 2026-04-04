"use client";

import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  Printer, 
  Save, 
  Search, 
  Calculator, 
  User, 
  Phone, 
  Package, 
  Receipt, 
  MapPin, 
  CheckCircle2,
  Box,
  Layers,
  Wrench,
  Truck
} from 'lucide-react';
import { calculateThreeTableSqFt, numberToWords } from '@/lib/utils';
import { EstimateItem, Estimate, Product, Customer, KhatabookEntry } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function EstimateForm() {
  const [customerName, setCustomerName] = useState('');
  const [village, setVillage] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isThekedarAccount, setIsThekedarAccount] = useState(false);
  const [items, setItems] = useState<EstimateItem[]>([
    { id: '1', particular: '', length: 0, width: 0, qty: 1, sqft: 0, rate: 0, costPrice: 0, amount: 0, isExtra: false }
  ]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [gstType, setGstType] = useState<'none' | 'sgst_cgst' | 'igst'>('none');
  const [gstRate, setGstRate] = useState(18);
  const [estNo, setEstNo] = useState('');
  const [date, setDate] = useState('');

  const [estimates, setEstimates] = useLocalStorage<Estimate[]>('bhumi_estimates', []);
  const [products] = useLocalStorage<Product[]>('bhumi_products', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('bhumi_customers', []);
  const [khatabook, setKhatabook] = useLocalStorage<KhatabookEntry[]>('bhumi_khatabook', []);
  const [showProductList, setShowProductList] = useState<{index: number, visible: boolean}>({ index: -1, visible: false });
  const [showThekedarSearch, setShowThekedarSearch] = useState(false);

  useEffect(() => {
    const now = new Date();
    setDate(now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    setEstNo(`EST-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  }, []);

  const addRow = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), particular: '', length: 0, width: 0, qty: 1, sqft: 0, rate: 0, costPrice: 0, amount: 0, isExtra: false }]);
    toast.success('Product row added');
  };

  const addExtraRow = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), particular: '', qty: 1, rate: 0, costPrice: 0, amount: 0, isExtra: true }]);
    toast.success('Hardware/Extra item added');
  };

  const deleteRow = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.error('Item removed');
  };

  const updateItem = (id: string, field: keyof EstimateItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value } as EstimateItem;
        if (!updated.isExtra) {
          if (['length', 'width', 'qty'].includes(field)) {
            updated.sqft = calculateThreeTableSqFt(Number(updated.length || 0), Number(updated.width || 0), Number(updated.qty));
          }
          updated.amount = Number(((updated.sqft || 0) * updated.rate).toFixed(2));
        } else {
          updated.amount = Number((updated.qty * updated.rate).toFixed(2));
        }
        return updated;
      }
      return item;
    }));
  };

  const selectProduct = (index: number, product: Product) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], particular: product.name, rate: product.defaultRate, costPrice: product.costPrice || 0 };
    if (!newItems[index].isExtra) {
      newItems[index].amount = Number(((newItems[index].sqft || 0) * newItems[index].rate).toFixed(2));
    } else {
      newItems[index].amount = Number((newItems[index].qty * newItems[index].rate).toFixed(2));
    }
    setItems(newItems);
    setShowProductList({ index: -1, visible: false });
    toast.info(`Selected ${product.name}`);
  };

  const selectThekedar = (thekedar: Customer) => {
    setCustomerName(thekedar.name);
    setVillage(thekedar.village || '');
    setMobileNumber(thekedar.mobile);
    setIsThekedarAccount(true);
    setShowThekedarSearch(false);
    toast.success(`Linked to Thekedar: ${thekedar.name}`);
  };

  const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalCost = items.reduce((sum, item) => {
    if (!item.isExtra) {
      return sum + ((item.sqft || 0) * (item.costPrice || 0));
    }
    return sum + (item.qty * (item.costPrice || 0));
  }, 0);
  const gstTotal = gstType === 'none' ? 0 : (subTotal * gstRate) / 100;
  const grandTotal = Math.round(subTotal + gstTotal - discount);
  const balance = grandTotal - paidAmount;

  const handleSave = () => {
    const newEstimate: Estimate = {
      id: Math.random().toString(36).substr(2, 9),
      estNo, date, customerName, village, mobileNumber, items,
      subTotal, totalCost, discount, gstType, gstRate, grandTotal, paidAmount, balance
    };
    
    setEstimates([...estimates, newEstimate]);

    if (isThekedarAccount && balance > 0) {
      const khatabookEntry: KhatabookEntry = {
        id: Math.random().toString(36).substr(2, 9),
        name: customerName,
        mobile: mobileNumber,
        amount: balance,
        type: 'take',
        dueDate: '',
        notes: `Linked to Bill No: ${estNo}`,
        createdAt: date
      };
      setKhatabook([...khatabook, khatabookEntry]);
      
      const updatedCustomers = customers.map(c => {
        if (c.mobile === mobileNumber) {
          return {
            ...c,
            totalOrders: c.totalOrders + 1,
            totalSpent: c.totalSpent + grandTotal,
            balance: c.balance + balance
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
    }

    toast.success('Bill Saved Successfully', {
      description: isThekedarAccount ? 'Transaction linked to Thekedar credit.' : 'Record stored in history.'
    });
  };

  // Helper to get category icon
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tile')) return <Box size={14} className="text-blue-500" />;
    if (n.includes('plywood') || n.includes('board')) return <Layers size={14} className="text-orange-500" />;
    if (n.includes('hardware') || n.includes('glue')) return <Wrench size={14} className="text-slate-500" />;
    return <Package size={14} className="text-emerald-500" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-6"
    >
      {/* ERP Entry Form */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 no-print">
        <div className="xl:col-span-3 erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title flex items-center gap-2">
              <Receipt size={16} className="text-emerald-600" />
              Standard Billing Entry {isThekedarAccount && <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] flex items-center gap-1"><CheckCircle2 size={10}/> Contractor Profile Linked</span>}
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="md:col-span-1 relative">
                <label className="erp-label">Customer / Contractor</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                  <input 
                    type="text" value={customerName} 
                    onChange={e => {
                      setCustomerName(e.target.value);
                      setShowThekedarSearch(true);
                      setIsThekedarAccount(false);
                    }} 
                    className="erp-input pl-10" placeholder="Search or Enter Name" 
                  />
                </div>
                <AnimatePresence>
                  {showThekedarSearch && customerName.length > 1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 top-full mt-1 w-full bg-white shadow-2xl rounded-lg border border-slate-200 z-50 max-h-48 overflow-y-auto"
                    >
                      <p className="p-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Thekedar Accounts Found</p>
                      {customers.filter(c => c.isThekedar && c.name.toLowerCase().includes(customerName.toLowerCase())).map(c => (
                        <div key={c.id} onClick={() => selectThekedar(c)} className="p-3 hover:bg-emerald-600 hover:text-white cursor-pointer flex justify-between items-center text-xs border-b border-slate-100 last:border-none group transition-colors">
                          <div>
                            <span className="font-bold group-hover:text-white">{c.name}</span>
                            <p className="text-[10px] text-slate-400 group-hover:text-white/70">{c.village} • {c.mobile}</p>
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded group-hover:bg-white/20 group-hover:text-white">Bal: ₹{c.balance}</span>
                        </div>
                      ))}
                      <div onClick={() => setShowThekedarSearch(false)} className="p-2 text-center text-[10px] font-bold text-slate-400 cursor-pointer uppercase hover:bg-slate-50 transition-colors">Dismiss</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="md:col-span-1">
                <label className="erp-label">Village / City</label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                  <input type="text" value={village} onChange={e => setVillage(e.target.value)} className="erp-input pl-10" placeholder="Village Name" />
                </div>
              </div>
              <div className="md:col-span-1">
                <label className="erp-label">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                  <input type="text" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="erp-input pl-10" placeholder="Contact No." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:col-span-1">
                <div>
                  <label className="erp-label">EST No.</label>
                  <input type="text" value={estNo} readOnly className="erp-input bg-slate-50 font-mono text-[11px] text-slate-400" />
                </div>
                <div>
                  <label className="erp-label">Date</label>
                  <input type="text" value={date} readOnly className="erp-input bg-slate-50 font-mono text-[11px] text-slate-400" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[10px] uppercase tracking-wider">
                    <th className="p-3 text-center w-10">#</th>
                    <th className="p-3 text-left">Item Description</th>
                    <th className="p-3 text-center w-28">Size (LxW)</th>
                    <th className="p-3 text-center w-16">Qty</th>
                    <th className="p-3 text-center w-20">Sqft</th>
                    <th className="p-3 text-center w-24">Rate</th>
                    <th className="p-3 text-right w-28">Total Amount</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group hover:bg-emerald-50/20 transition-colors">
                      <td className="p-2 text-center text-slate-300 font-bold text-xs">{index + 1}</td>
                      <td className="p-2 relative">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.particular)}
                          <input 
                            list="stock-products"
                            className="erp-input !border-transparent hover:!border-slate-200 focus:!border-emerald-500 font-bold !bg-transparent flex-1"
                            value={item.particular}
                            onChange={e => { updateItem(item.id, 'particular', e.target.value); setShowProductList({ index, visible: true }); }}
                            onFocus={() => setShowProductList({ index, visible: true })}
                            placeholder="Type Item Name..."
                          />
                        </div>
                        <datalist id="stock-products">
                          {products.map(p => <option key={p.id} value={p.name} />)}
                        </datalist>
                        {showProductList.index === index && showProductList.visible && (
                          <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-2xl rounded-lg border border-slate-200 z-50 max-h-48 overflow-y-auto">
                            {products.filter(p => p.name.toLowerCase().includes(item.particular.toLowerCase())).map(p => (
                              <div key={p.id} onClick={() => selectProduct(index, p)} className="p-3 hover:bg-emerald-600 hover:text-white cursor-pointer flex justify-between items-center text-xs border-b border-slate-100 last:border-none group/item">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(p.name)}
                                  <span className="font-bold">{p.name}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono block">₹{p.defaultRate}</span>
                                  <span className="text-[9px] text-slate-400 group-hover/item:text-emerald-100">In Stock: {p.stock}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        {!item.isExtra ? (
                          <div className="flex items-center gap-1">
                            <input type="number" className="erp-input !p-1 text-center" value={item.length || ''} onChange={e => updateItem(item.id, 'length', e.target.value)} />
                            <span className="text-slate-300 font-bold">×</span>
                            <input type="number" className="erp-input !p-1 text-center" value={item.width || ''} onChange={e => updateItem(item.id, 'width', e.target.value)} />
                          </div>
                        ) : (
                          <div className="text-center text-slate-300 text-[10px] font-bold uppercase italic flex items-center justify-center gap-1">
                            <Wrench size={10}/> Hardware
                          </div>
                        )}
                      </td>
                      <td className="p-2"><input type="number" className="erp-input !p-1 text-center" value={item.qty || ''} onChange={e => updateItem(item.id, 'qty', e.target.value)} /></td>
                      <td className="p-2 text-center font-bold text-emerald-600">
                        {!item.isExtra ? (item.sqft || 0).toFixed(2) : <span className="text-slate-300 opacity-50">-</span>}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-slate-300 text-[10px]">₹</span>
                          <input type="number" className="erp-input !p-1 text-center font-bold w-full" value={item.rate || ''} onChange={e => updateItem(item.id, 'rate', e.target.value)} />
                        </div>
                      </td>
                      <td className="p-2 text-right font-black text-slate-800">₹{(item.amount || 0).toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => deleteRow(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={addRow} className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest px-5 py-2.5 border border-dashed border-emerald-200 rounded-lg bg-emerald-50/50 transition-all hover:bg-emerald-50">
                <Plus size={14} /> Add Tile/Board
              </button>
              <button onClick={addExtraRow} className="flex items-center gap-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest px-5 py-2.5 border border-dashed border-blue-200 rounded-lg bg-blue-50/50 transition-all hover:bg-blue-50">
                <Plus size={14} /> Add Hardware/Other
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="erp-card p-6 bg-slate-800 text-white border-none shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500 rounded-full blur-3xl opacity-10"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-white/10 pb-3 flex items-center gap-2 relative z-10">
              <Calculator size={14} className="text-emerald-500" />
              Bill Summary
            </h3>
            <div className="space-y-4 text-sm font-medium relative z-10">
              <div className="flex justify-between text-slate-300"><span>Subtotal (Net)</span><span>₹ {subTotal.toFixed(2)}</span></div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">GST Mode</label>
                <select value={gstType} onChange={e => setGstType(e.target.value as any)} className="w-full bg-white/10 border border-white/10 rounded px-2 py-2 text-xs outline-none focus:border-emerald-500 transition-colors">
                  <option value="none" className="text-slate-800">None (Cash Memo)</option>
                  <option value="sgst_cgst" className="text-slate-800">Local (SGST+CGST 18%)</option>
                  <option value="igst" className="text-slate-800">Interstate (IGST 18%)</option>
                </select>
              </div>
              <div className="flex justify-between group pt-2">
                <span className="text-slate-400">Total Discount</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">₹</span>
                  <input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} className="w-20 bg-transparent text-right outline-none border-b border-white/10 focus:border-emerald-500 font-bold" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black tracking-tight text-white">₹ {(grandTotal || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex justify-between group pt-2">
                <span className="text-slate-400">Paid Amount</span>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="text-[10px]">₹</span>
                  <input type="number" value={paidAmount || ''} onChange={e => setPaidAmount(Number(e.target.value))} className="w-24 bg-transparent text-right outline-none border-b border-white/10 focus:border-emerald-500" />
                </div>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex justify-between items-center text-red-400 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest">Balance</span>
                <span className="text-xl font-black tracking-tight">₹ {balance.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
              <button onClick={() => window.print()} className="btn-primary w-full !text-[10px] !py-3 uppercase tracking-widest border-b-4 border-emerald-800">
                <Printer size={14} /> Print
              </button>
              <button onClick={handleSave} className="btn-secondary w-full !text-[10px] !py-3 uppercase tracking-widest border-b-4 border-black">
                <Save size={14} /> Save Bill
              </button>
            </div>
          </div>
          
          <div className="erp-card p-4 bg-emerald-50 border-emerald-100 flex items-center gap-3">
            <Truck size={20} className="text-emerald-600" />
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Delivery Support</p>
              <p className="text-[11px] text-emerald-600 font-medium leading-none">Ready for pickup/dispatch</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Printable Invoice Section */}
      <div className="hidden print:block invoice-container bg-white text-black min-h-screen">
        <header className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={64} height={64} className="object-contain" priority unoptimized />
            <div>
              <h1 className="text-2xl font-black uppercase leading-none mb-1">Bhumika Tiles</h1>
              <p className="font-bold text-xs uppercase tracking-[0.2em] text-gray-600">Building Material & Tiles Hub</p>
              <p className="text-[9px] mt-1 font-bold">Parola, Dist. Jalgaon | Mobile: 8010060992 | Manager: Rohit Chavan</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black uppercase tracking-[0.3em] mb-2 text-gray-400">Estimate</h2>
            <div className="text-[10px] space-y-0.5 font-bold">
              <p className="flex justify-between gap-4"><span>Est No:</span> <span>{estNo}</span></p>
              <p className="flex justify-between gap-4"><span>Date:</span> <span>{date}</span></p>
            </div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-8 border-2 border-black p-4 rounded-xl">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">Bill To Customer:</p>
            <p className="text-lg font-black uppercase leading-none">{customerName || 'Walk-in Customer'}</p>
            <div className="flex flex-col gap-0.5 pt-1">
              <p className="text-[11px] font-bold flex items-center gap-1"><MapPin size={10}/> Village: {village || 'Local'}</p>
              <p className="text-[11px] font-bold flex items-center gap-1"><Phone size={10}/> Mobile: {mobileNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="text-[10px] font-black uppercase text-emerald-600">Payment Status: {balance > 0 ? 'DUE' : 'PAID'}</p>
            <p className="text-[9px] font-bold mt-1 text-gray-400">Parola, Maharashtra</p>
          </div>
        </section>

        <table className="w-full text-xs border-collapse border-2 border-black mb-6">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black">
              <th className="p-2 border-r-2 border-black w-8 font-black uppercase text-[10px]">#</th>
              <th className="p-2 border-r-2 border-black text-left font-black uppercase text-[10px]">Description of Goods</th>
              <th className="p-2 border-r-2 border-black w-24 text-center font-black uppercase text-[10px]">Size (LxW)</th>
              <th className="p-2 border-r-2 border-black w-12 text-center font-black uppercase text-[10px]">Qty</th>
              <th className="p-2 border-r-2 border-black w-16 text-center font-black uppercase text-[10px]">Sqft</th>
              <th className="p-2 border-r-2 border-black w-20 text-center font-black uppercase text-[10px]">Rate</th>
              <th className="p-2 text-right font-black uppercase text-[10px] w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="p-2 border-r-2 border-black text-center font-bold">{index + 1}</td>
                <td className="p-2 border-r-2 border-black font-black uppercase">
                  {item.particular}
                  {item.isExtra && <span className="ml-2 text-[8px] font-medium opacity-50 lowercase">(hardware/other)</span>}
                </td>
                <td className="p-2 border-r-2 border-black text-center font-bold">
                  {!item.isExtra ? `${item.length} x ${item.width}` : '-'}
                </td>
                <td className="p-2 border-r-2 border-black text-center font-bold">{item.qty}</td>
                <td className="p-2 border-r-2 border-black text-center font-black text-emerald-700">
                  {!item.isExtra ? (item.sqft || 0).toFixed(2) : '-'}
                </td>
                <td className="p-2 border-r-2 border-black text-center font-bold">₹{item.rate}</td>
                <td className="p-2 text-right font-black">₹{(item.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-start gap-10">
          <div className="flex-1">
            <div className="border-2 border-black p-4 rounded-xl mb-4 bg-gray-50/50">
              <span className="text-[9px] font-black uppercase block mb-2 text-gray-400 tracking-widest">Total Bill in Words:</span>
              <p className="text-sm font-black uppercase leading-tight">{numberToWords(grandTotal)} Rupees Only</p>
            </div>
            <div className="text-[9px] font-bold uppercase leading-relaxed italic opacity-40 px-2 border-l-2 border-black">
              Note: 1. Prices subject to market change. 2. Goods once sold will not be returned. 3. This is an estimate only.
            </div>
          </div>
          <div className="w-72 border-2 border-black rounded-xl overflow-hidden shadow-sm">
            <div className="p-2 border-b border-black flex justify-between font-bold text-[11px] text-gray-500 uppercase"><span>Subtotal (Net)</span><span>₹ {subTotal.toFixed(2)}</span></div>
            {gstType !== 'none' && <div className="p-2 border-b border-black flex justify-between font-bold text-[11px] text-gray-500 uppercase"><span>GST Charges (18%)</span><span>₹ {gstTotal.toFixed(2)}</span></div>}
            <div className="p-2 border-b border-black flex justify-between font-bold text-[11px] text-gray-500 uppercase"><span>Total Discount</span><span>- ₹ {discount.toFixed(2)}</span></div>
            <div className="p-3 bg-gray-900 text-white flex justify-between font-black text-sm uppercase tracking-widest"><span>Grand Total</span><span>₹ {grandTotal.toLocaleString('en-IN')}</span></div>
            <div className="p-3 flex justify-between font-black text-sm text-red-600 uppercase tracking-tighter bg-red-50 italic"><span>Balance Due</span><span>₹ {balance.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div className="mt-20 flex justify-between px-10">
          <div className="text-center w-56"><div className="border-t-2 border-black pt-2 font-black text-[10px] uppercase tracking-widest">Customer Signature</div></div>
          <div className="text-center w-56">
            <div className="border-t-2 border-black pt-2 font-black text-[10px] uppercase tracking-widest">Authorized Signatory</div>
            <p className="text-[9px] font-bold italic mt-1 text-gray-400">(Bhumika Tiles)</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
