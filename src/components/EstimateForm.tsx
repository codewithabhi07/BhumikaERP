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
  Truck,
  MessageCircle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  Scissors,
  Share2,
  Eye,
  X
} from 'lucide-react';
import { calculateThreeTableSqFt, numberToWords } from '@/lib/utils';
import { numberToMarathiWords, translateMaterialToMarathi } from '@/lib/marathi';
import { EstimateItem, Estimate, Product, Customer, KhatabookEntry, CuttingOrder } from '@/types';
import { EstimateService, ProductService, CustomerService, KhatabookService, SettingsService, CuttingService } from '@/lib/api';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { WhatsAppShareModal } from './WhatsAppShareModal';

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

  // Print mode: 'invoice' | 'cutting'
  const [printMode, setPrintMode] = useState<'invoice' | 'cutting'>('invoice');
  const [showCuttingModal, setShowCuttingModal] = useState(false);
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    type: 'bill' | 'cutting';
    data: any;
    title?: string;
    plainTextMessage?: string;
  }>({
    isOpen: false,
    type: 'bill',
    data: null,
  });

  const [shopSettings, setShopSettings] = useState({
    shopName: 'Bhumika Tiles & Building Material',
    managerName: 'Rohit Chavan',
    phone: '8010060992',
    location: 'Parola, Dist. Jalgaon'
  });

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [khatabook, setKhatabook] = useState<KhatabookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProductList, setShowProductList] = useState<{index: number, visible: boolean}>({ index: -1, visible: false });
  const [showThekedarSearch, setShowThekedarSearch] = useState(false);

  const initNewBill = () => {
    const now = new Date();
    setDate(now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    setEstNo(`EST-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    setCustomerName('');
    setVillage('');
    setMobileNumber('');
    setIsThekedarAccount(false);
    setItems([{ id: Math.random().toString(36).substr(2, 9), particular: '', length: 0, width: 0, qty: 1, sqft: 0, rate: 0, costPrice: 0, amount: 0, isExtra: false }]);
    setDiscount(0);
    setPaidAmount(0);
    setGstType('none');
  };

  useEffect(() => {
    const now = new Date();
    setDate(now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    setEstNo(`EST-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    
    const fetchData = async () => {
      try {
        const [estData, prodData, custData, khataData, settingsData] = await Promise.all([
          EstimateService.getAll(),
          ProductService.getAll(),
          CustomerService.getAll(),
          KhatabookService.getAll(),
          SettingsService.get().catch(() => null)
        ]);
        setEstimates(estData || []);
        setProducts(prodData || []);
        setCustomers(custData || []);
        setKhatabook(khataData || []);
        if (settingsData) {
          setShopSettings({
            shopName: settingsData.shopName || 'Bhumika Tiles & Building Material',
            managerName: settingsData.managerName || 'Rohit Chavan',
            phone: settingsData.phone || '8010060992',
            location: settingsData.location || 'Parola, Dist. Jalgaon'
          });
        }
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addRow = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), particular: '', length: 0, width: 0, qty: 1, sqft: 0, rate: 0, costPrice: 0, amount: 0, isExtra: false }]);
    toast.success('Tile/Board measurement row added');
  };

  const addExtraRow = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), particular: '', qty: 1, rate: 0, costPrice: 0, amount: 0, isExtra: true }]);
    toast.success('Hardware/Extra item added');
  };

  const deleteRow = (id: string) => {
    if (items.length === 1) {
      setItems([{ id: Math.random().toString(36).substr(2, 9), particular: '', length: 0, width: 0, qty: 1, sqft: 0, rate: 0, costPrice: 0, amount: 0, isExtra: false }]);
      return;
    }
    setItems(items.filter(item => item.id !== id));
    toast.info('Item removed');
  };

  // Strict calculation logic preserved
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
    newItems[index] = { 
      ...newItems[index], 
      particular: product.name, 
      rate: product.defaultRate, 
      costPrice: product.costPrice || 0 
    };
    if (!newItems[index].isExtra) {
      newItems[index].amount = Number(((newItems[index].sqft || 0) * newItems[index].rate).toFixed(2));
    } else {
      newItems[index].amount = Number((newItems[index].qty * newItems[index].rate).toFixed(2));
    }
    setItems(newItems);
    setShowProductList({ index: -1, visible: false });
    toast.info(`Selected product: ${product.name}`);
  };

  const selectThekedar = (thekedar: Customer) => {
    setCustomerName(thekedar.name);
    setVillage(thekedar.village || '');
    setMobileNumber(thekedar.mobile);
    setIsThekedarAccount(true);
    setShowThekedarSearch(false);
    toast.success(`Linked to Contractor Profile: ${thekedar.name}`);
  };

  // Arithmetic formulas preserved strictly
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

  const handleSave = async () => {
    if (items.every(item => !item.particular.trim())) {
      toast.error('Please enter at least one item');
      return;
    }

    const newEstimate: Partial<Estimate> = {
      estNo, date, customerName: customerName.trim() || 'Walk-in Customer', village, mobileNumber, items,
      subTotal, totalCost, discount, gstType, gstRate, grandTotal, paidAmount, balance
    };
    
    try {
      const savedEst = await EstimateService.create(newEstimate);
      setEstimates([...estimates, savedEst]);

      // Automatically create Cutting Order in workshop queue
      const cuttingItems = items
        .filter(it => it.particular && it.particular.trim().length > 0)
        .map(it => ({
          id: it.id || Math.random().toString(36).substr(2, 9),
          particular: it.particular,
          length: it.length,
          width: it.width,
          qty: it.qty,
          sqft: it.sqft,
          isExtra: it.isExtra,
          notes: ''
        }));

      if (cuttingItems.length > 0) {
        await CuttingService.create({
          estNo,
          date,
          customerName: customerName.trim() || 'Walk-in Customer',
          village: village.trim(),
          mobileNumber: mobileNumber.trim(),
          items: cuttingItems,
          status: 'pending',
          createdAt: date
        });
      }

      if (isThekedarAccount && balance > 0) {
        const khatabookEntry: Partial<KhatabookEntry> = {
          name: customerName,
          mobile: mobileNumber,
          amount: balance,
          type: 'take',
          dueDate: '',
          notes: `Linked to Bill No: ${estNo}`,
          createdAt: date
        };
        const savedKhata = await KhatabookService.create(khatabookEntry);
        setKhatabook([...khatabook, savedKhata]);
        
        const currentCustomer = customers.find(c => c.mobile === mobileNumber);
        if (currentCustomer) {
          const updatedCust = await CustomerService.update(currentCustomer.id, {
            totalOrders: (currentCustomer.totalOrders || 0) + 1,
            totalSpent: (currentCustomer.totalSpent || 0) + grandTotal,
            balance: (currentCustomer.balance || 0) + balance
          });
          setCustomers(customers.map(c => c.id === updatedCust.id ? updatedCust : c));
        }
      }

      toast.success('Bill & Cutting Material Slip Saved!', {
        description: `Bill ${estNo} recorded and cutting order queued for workshop.`
      });
    } catch (error) {
      toast.error('Failed to save bill');
    }
  };

  const handlePrintInvoice = () => {
    setPrintMode('invoice');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePrintCuttingSlip = () => {
    setPrintMode('cutting');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleWhatsAppBill = () => {
    const validItems = items.filter(it => it.particular && it.particular.trim() !== '');
    if (validItems.length === 0) {
      toast.error('Please add at least one item before sharing bill');
      return;
    }

    const currentEstimate = {
      id: estNo,
      estNo,
      date,
      customerName: customerName || 'Walk-in Customer',
      village: village || 'Local',
      mobileNumber,
      items: validItems,
      subTotal,
      totalCost: 0,
      discount,
      gstType,
      gstRate,
      grandTotal,
      paidAmount,
      balance,
    };

    const message = `*BHUMIKA TILES & BUILDING MATERIAL*\n*Estimate Bill: ${estNo}*\nDate: ${date}\nCustomer: ${customerName || 'Customer'}\n---------------------------\n${validItems.map((it, idx) => `${idx + 1}. ${it.particular} ${!it.isExtra ? `(${it.length}x${it.width} = ${it.sqft} sqft)` : `(Qty: ${it.qty})`} @ ₹${it.rate} = ₹${it.amount}`).join('\n')}\n---------------------------\n*Total Amount:* ₹${grandTotal.toLocaleString('en-IN')}\n*Paid:* ₹${paidAmount.toLocaleString('en-IN')}\n*Balance Due:* ₹${balance.toLocaleString('en-IN')}\n\nThank you for choosing Bhumika Tiles!`;

    setShareModal({
      isOpen: true,
      type: 'bill',
      data: currentEstimate,
      title: `Share Bill ${estNo} on WhatsApp`,
      plainTextMessage: message,
    });
  };

  const handleWhatsAppCuttingSlip = () => {
    const validItems = items.filter(it => it.particular && it.particular.trim() !== '');
    if (validItems.length === 0) {
      toast.error('Please add at least one item before sharing cutting slip');
      return;
    }

    const currentCutting = {
      estNo,
      date,
      customerName: customerName || 'Walk-in Customer',
      village: village || 'Local',
      mobileNumber,
      items: validItems,
      status: 'pending',
    };

    const message = `*BHUMIKA TILES - WORKSHOP CUTTING SLIP (कटिंग स्लिप)*\n*Bill No:* ${estNo}\n*Customer:* ${customerName || 'Customer'}\n*Date:* ${date}\n*Site/Village:* ${village || 'Local'}\n---------------------------\n*CUTTING MEASUREMENTS & SIZES:*\n${validItems.map((it, idx) => `${idx + 1}. *${it.particular}*\n   Size: ${!it.isExtra ? `${it.length}" × ${it.width}" (${it.sqft} Sqft)` : `Hardware/Unit`}\n   Quantity: ${it.qty} Pcs`).join('\n')}\n---------------------------\n*Cutting Status:* In Workshop Processing\nThank you!`;

    setShareModal({
      isOpen: true,
      type: 'cutting',
      data: currentCutting,
      title: `Share Workshop Cutting Slip (${estNo}) on WhatsApp`,
      plainTextMessage: message,
    });
  };

  const getCategoryIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('tile') || n.includes('floor') || n.includes('wall')) return <Box size={14} className="text-blue-500" />;
    if (n.includes('plywood') || n.includes('board') || n.includes('sheet')) return <Layers size={14} className="text-amber-500" />;
    if (n.includes('hardware') || n.includes('glue') || n.includes('screw')) return <Wrench size={14} className="text-slate-500" />;
    return <Package size={14} className="text-emerald-500" />;
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Billing Interface...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Action Header on Screen */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
              <Receipt size={12} /> Billing & Cutting Work Order
            </span>
            {isThekedarAccount && (
              <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border border-blue-200">
                <CheckCircle2 size={11} /> Contractor Account Linked
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Create Bill & Cutting Slip
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={initNewBill}
            className="btn-outline text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            title="Clear and Start Fresh"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          
          {/* Print Options */}
          <button 
            onClick={handlePrintCuttingSlip} 
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Print Workshop Cutting Slip"
          >
            <Scissors size={14} className="text-amber-600" />
            <span>Print Cutting Slip</span>
          </button>

          <button 
            onClick={handlePrintInvoice} 
            className="btn-outline flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>Print Invoice</span>
          </button>

          <button 
            onClick={handleSave} 
            className="btn-primary flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Save Bill</span>
          </button>
        </div>
      </div>

      {/* Main Billing Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 no-print">
        {/* Left 3 Columns: Customer details & Items Table */}
        <div className="xl:col-span-3 space-y-6">
          {/* Customer Metadata Card */}
          <div className="erp-card p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Customer Name */}
              <div className="relative">
                <label className="erp-label">Customer / Contractor</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={15} />
                  <input 
                    type="text" 
                    value={customerName} 
                    onChange={e => {
                      setCustomerName(e.target.value);
                      setShowThekedarSearch(true);
                      setIsThekedarAccount(false);
                    }} 
                    className="erp-input pl-10" 
                    placeholder="Customer / Thekedar Name" 
                  />
                </div>

                {/* Thekedar Dropdown Search */}
                <AnimatePresence>
                  {showThekedarSearch && customerName.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-0 top-full mt-1 w-full bg-white shadow-2xl rounded-xl border border-slate-200 z-50 max-h-48 overflow-y-auto"
                    >
                      <div className="p-2 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        Thekedar Accounts
                      </div>
                      {customers
                        .filter(c => c.isThekedar && c.name.toLowerCase().includes(customerName.toLowerCase()))
                        .map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => selectThekedar(c)} 
                            className="p-2.5 hover:bg-emerald-600 hover:text-white cursor-pointer flex justify-between items-center text-xs border-b border-slate-100 last:border-none group transition-colors"
                          >
                            <div>
                              <span className="font-bold group-hover:text-white">{c.name}</span>
                              <p className="text-[10px] text-slate-400 group-hover:text-white/80">{c.village} • {c.mobile}</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold group-hover:bg-white/20 group-hover:text-white">
                              Bal: ₹{c.balance || 0}
                            </span>
                          </div>
                        ))}
                      <div 
                        onClick={() => setShowThekedarSearch(false)} 
                        className="p-2 text-center text-[10px] font-bold text-slate-400 cursor-pointer uppercase hover:bg-slate-50"
                      >
                        Close
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Village */}
              <div>
                <label className="erp-label">Village / Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={15} />
                  <input 
                    type="text" 
                    value={village} 
                    onChange={e => setVillage(e.target.value)} 
                    className="erp-input pl-10" 
                    placeholder="Village Name (e.g. Lasur)" 
                  />
                </div>
              </div>

              {/* Mobile / WhatsApp Number */}
              <div>
                <label className="erp-label flex items-center justify-between">
                  <span>WhatsApp Mobile No.</span>
                  <span className="text-[9px] text-emerald-600 font-bold lowercase flex items-center gap-1">
                    <MessageCircle size={10} /> for cutting slip
                  </span>
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={15} />
                  <input 
                    type="text" 
                    value={mobileNumber} 
                    onChange={e => setMobileNumber(e.target.value)} 
                    className="erp-input pl-10 font-mono font-bold" 
                    placeholder="10-digit number" 
                  />
                </div>
              </div>

              {/* Bill Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="erp-label">Est No.</label>
                  <input 
                    type="text" 
                    value={estNo} 
                    readOnly 
                    className="erp-input bg-slate-100 font-mono text-[11px] text-slate-600 font-bold" 
                  />
                </div>
                <div>
                  <label className="erp-label">Date</label>
                  <input 
                    type="text" 
                    value={date} 
                    readOnly 
                    className="erp-input bg-slate-100 font-mono text-[11px] text-slate-600 font-bold" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Entry Table Card */}
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">
                <Layers size={16} className="text-emerald-600" />
                Line Items & Cutting Dimensions (Tiles, Boards, Hardware)
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-200 text-[10px] sm:text-[11px] uppercase tracking-wider select-none">
                    <th className="p-3 text-center w-10">#</th>
                    <th className="p-3 text-left">मालाचा तपशील (Description)</th>
                    <th className="p-3 text-center w-32">साईझ (LxW in)</th>
                    <th className="p-3 text-center w-20">नग (Qty)</th>
                    <th className="p-3 text-center w-24">फूट (Sqft)</th>
                    <th className="p-3 text-center w-28">दर (Rate ₹)</th>
                    <th className="p-3 text-right w-32">रक्कम (Amount ₹)</th>
                    <th className="p-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {items.map((item, index) => {
                    const marathiName = translateMaterialToMarathi(item.particular);
                    return (
                    <tr key={item.id} className="group hover:bg-emerald-50/30 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-bold text-xs">
                        {index + 1}
                      </td>

                      {/* Product Name Input with Auto-complete */}
                      <td className="p-2 relative min-w-[180px]">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.particular)}
                          <div className="flex-1">
                            <input 
                              list="billing-stock-products"
                              className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs sm:text-sm outline-none transition-colors"
                              value={item.particular}
                              onChange={e => { 
                                updateItem(item.id, 'particular', e.target.value); 
                                setShowProductList({ index, visible: true }); 
                              }}
                              onFocus={() => setShowProductList({ index, visible: true })}
                              placeholder="Type product name (उदा. Granite, Tiles)..."
                            />
                            {marathiName && (
                              <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-200 mt-0.5">
                                मराठी नाव: {marathiName}
                              </div>
                            )}
                          </div>
                        </div>

                        <datalist id="billing-stock-products">
                          {products.map(p => <option key={p.id} value={p.name} />)}
                        </datalist>

                        {/* Product Picker Dropdown */}
                        {showProductList.index === index && showProductList.visible && (
                          <div className="absolute left-0 top-full mt-1 w-full min-w-[240px] bg-white shadow-2xl rounded-xl border border-slate-200 z-50 max-h-48 overflow-y-auto">
                            {products
                              .filter(p => p.name.toLowerCase().includes((item.particular || '').toLowerCase()))
                              .map(p => (
                                <div 
                                  key={p.id} 
                                  onClick={() => selectProduct(index, p)} 
                                  className="p-2.5 hover:bg-emerald-600 hover:text-white cursor-pointer flex justify-between items-center text-xs border-b border-slate-100 last:border-none group/item transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    {getCategoryIcon(p.name)}
                                    <span className="font-bold">{p.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono font-bold block">₹{p.defaultRate}</span>
                                    <span className="text-[9px] text-slate-400 group-hover/item:text-emerald-100">
                                      Stock: {p.stock}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </td>

                      {/* Size (LxW) */}
                      <td className="p-2 text-center">
                        {!item.isExtra ? (
                          <div className="flex items-center justify-center gap-1">
                            <input 
                              type="number" 
                              className="w-12 bg-white border border-slate-300 rounded-lg p-1.5 text-center font-bold text-xs outline-none focus:border-emerald-500 font-mono" 
                              placeholder="L"
                              value={item.length || ''} 
                              onChange={e => updateItem(item.id, 'length', e.target.value)} 
                            />
                            <span className="text-slate-400 font-bold">×</span>
                            <input 
                              type="number" 
                              className="w-12 bg-white border border-slate-300 rounded-lg p-1.5 text-center font-bold text-xs outline-none focus:border-emerald-500 font-mono" 
                              placeholder="W"
                              value={item.width || ''} 
                              onChange={e => updateItem(item.id, 'width', e.target.value)} 
                            />
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Wrench size={11} /> Hardware / Unit
                          </span>
                        )}
                      </td>

                      {/* Qty */}
                      <td className="p-2 text-center">
                        <input 
                          type="number" 
                          className="w-14 bg-white border border-slate-300 rounded-lg p-1.5 text-center font-bold text-xs outline-none focus:border-emerald-500 mx-auto font-mono" 
                          value={item.qty || ''} 
                          onChange={e => updateItem(item.id, 'qty', e.target.value)} 
                        />
                      </td>

                      {/* Sqft */}
                      <td className="p-2 text-center">
                        {!item.isExtra ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200 font-mono">
                            {(item.sqft || 0).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Rate */}
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1 focus-within:border-emerald-500">
                          <span className="text-slate-400 text-xs">₹</span>
                          <input 
                            type="number" 
                            className="w-16 bg-transparent text-center font-bold text-xs outline-none font-mono" 
                            value={item.rate || ''} 
                            onChange={e => updateItem(item.id, 'rate', e.target.value)} 
                          />
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-2 text-right font-black text-slate-800 text-sm font-mono">
                        ₹ {(item.amount || 0).toFixed(2)}
                      </td>

                      {/* Delete */}
                      <td className="p-2 text-center">
                        <button 
                          onClick={() => deleteRow(item.id)} 
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            {/* Add Row Buttons Toolbar */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap gap-3">
              <button 
                onClick={addRow} 
                className="flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider px-4 py-2.5 border border-dashed border-emerald-300 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-all shadow-sm"
              >
                <Plus size={15} /> Add Measurement Item (Tiles / Plywood)
              </button>
              <button 
                onClick={addExtraRow} 
                className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-800 uppercase tracking-wider px-4 py-2.5 border border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all shadow-sm"
              >
                <Plus size={15} /> Add Unit Item (Hardware / Glue / Labour)
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Summary & Cutting Slip Actions */}
        <div className="space-y-6">
          <div className="erp-card p-6 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
            
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-5 border-b border-white/10 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calculator size={16} className="text-emerald-400" />
                Calculation Breakdown
              </span>
            </h3>

            <div className="space-y-4 text-sm font-medium relative z-10">
              <div className="flex justify-between items-center text-slate-300">
                <span>Subtotal (Gross)</span>
                <span className="font-mono font-bold">₹ {subTotal.toFixed(2)}</span>
              </div>

              {/* GST Type Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                  Tax Calculation Mode
                </label>
                <select 
                  value={gstType} 
                  onChange={e => setGstType(e.target.value as any)} 
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 transition-colors"
                >
                  <option value="none">No GST (Standard Estimate / Cash Memo)</option>
                  <option value="sgst_cgst">SGST + CGST (18% Local State)</option>
                  <option value="igst">IGST (18% Interstate)</option>
                </select>
              </div>

              {gstType !== 'none' && (
                <div className="flex justify-between items-center text-emerald-400 text-xs">
                  <span>GST (18%):</span>
                  <span className="font-mono font-bold">+ ₹ {gstTotal.toFixed(2)}</span>
                </div>
              )}

              {/* Discount Input */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-300 text-xs font-semibold">Discount Amount</span>
                <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <span className="text-[11px] text-slate-400">₹</span>
                  <input 
                    type="number" 
                    value={discount || ''} 
                    onChange={e => setDiscount(Number(e.target.value))} 
                    className="w-20 bg-transparent text-right outline-none text-white font-mono font-bold text-xs" 
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black tracking-tight text-white font-mono">
                    ₹ {(grandTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Paid Amount */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-300 text-xs font-semibold">Received Payment</span>
                <div className="flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-700/60 text-emerald-400">
                  <span className="text-[11px]">₹</span>
                  <input 
                    type="number" 
                    value={paidAmount || ''} 
                    onChange={e => setPaidAmount(Number(e.target.value))} 
                    className="w-24 bg-transparent text-right outline-none font-mono font-bold text-xs text-emerald-300" 
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Balance Card */}
              <div className={`p-4 rounded-xl flex justify-between items-center border mt-4 ${
                balance > 0 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                <span className="text-[10px] font-extrabold uppercase tracking-widest">
                  {balance > 0 ? 'Balance Pending' : 'Payment Cleared'}
                </span>
                <span className="text-xl font-black font-mono tracking-tight">
                  ₹ {balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Save Bill Action */}
            <div className="mt-6 space-y-2.5 relative z-10">
              <button 
                onClick={handleSave} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Save size={15} /> Save Bill & Cutting Order
              </button>

              {/* WhatsApp Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button 
                  onClick={handleWhatsAppCuttingSlip} 
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold py-2.5 px-3 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  title="Share Cutting Material Sizes on WhatsApp"
                >
                  <Scissors size={13} /> WhatsApp Cutting
                </button>
                <button 
                  onClick={handleWhatsAppBill} 
                  className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 font-bold py-2.5 px-3 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  title="Share Invoice Bill on WhatsApp"
                >
                  <MessageCircle size={13} /> WhatsApp Bill
                </button>
              </div>

              {/* Print Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handlePrintCuttingSlip} 
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2.5 px-3 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  title="Print Workshop Cutting Order"
                >
                  <Scissors size={13} /> Print Cutting Slip
                </button>
                <button 
                  onClick={handlePrintInvoice} 
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  title="Print Customer Bill Invoice"
                >
                  <Printer size={13} /> Print Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Quick Link to Delivery Challan */}
          <div className="erp-card p-4.5 bg-white border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-800 font-extrabold uppercase text-[10px] tracking-wider">
              <span className="flex items-center gap-1.5">
                <Truck size={14} className="text-emerald-600" />
                <span>Delivery & Dispatch</span>
              </span>
              <span className="text-[9px] text-emerald-600 font-bold">Challan Available</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Once cutting material is finished, create and print the 2-copy Delivery Challan.
            </p>
            <Link
              href="/challans"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
            >
              <Truck size={13} className="text-emerald-600" />
              <span>Go to Cutting & Challan Manager</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRINTABLE ESTIMATE INVOICE (A4 Half-Size / A5 Format - Ink Saver) */}
      {/* ========================================================================= */}
      {printMode === 'invoice' && (
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
                <p className="font-mono">बिल नं: <span className="font-black">{estNo}</span></p>
                <p>तारीख: {date}</p>
              </div>
            </div>
          </header>

          {/* Customer & Payment Meta */}
          <section className="mb-2 grid grid-cols-2 gap-2 border border-black p-2 rounded-lg bg-white text-[9px] text-black">
            <div>
              <p className="text-[7.5px] uppercase font-black text-black tracking-wider">ग्राहकाचे नाव (Billed To):</p>
              <p className="text-xs font-black uppercase text-black">{customerName || 'Walk-in Customer (रोख ग्राहक)'}</p>
              <div className="text-[8.5px] font-bold text-black mt-0.5">
                <span>गाव/पत्ता: {village || 'Local'}</span> • <span>मोबाईल: {mobileNumber || 'N/A'}</span>
              </div>
            </div>
            <div className="text-right flex flex-col justify-center">
              <p className="font-black uppercase text-black text-[10px]">
                {balance > 0 ? `बाकी रक्कम: ₹${balance.toLocaleString('en-IN')}` : 'पूर्ण जमा (FULL PAID)'}
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
                <th className="p-1 pr-1.5 text-right font-black uppercase">रक्कम (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y border-black">
              {items.map((item, index) => {
                const marathiName = translateMaterialToMarathi(item.particular);
                return (
                  <tr key={item.id} className="text-black">
                    <td className="p-1 border-r border-black text-center font-bold text-[8.5px]">{index + 1}</td>
                    <td className="p-1 pl-2 border-r border-black font-black uppercase text-[8.5px] truncate">
                      <span>{item.particular}</span>
                      {marathiName && <span className="ml-1 text-[7.5px] font-bold">({marathiName})</span>}
                      {item.isExtra && <span className="ml-1 text-[7px] font-medium lowercase">(नग)</span>}
                    </td>
                    <td className="p-1 border-r border-black text-center font-bold text-[8.5px] font-mono">
                      {!item.isExtra ? `${item.length}" × ${item.width}"` : '-'}
                    </td>
                    <td className="p-1 border-r border-black text-center font-bold text-[8.5px]">{item.qty}</td>
                    <td className="p-1 border-r border-black text-center font-black text-[8.5px]">
                      {!item.isExtra ? (item.sqft || 0).toFixed(2) : '-'}
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
                  {numberToMarathiWords(grandTotal)}
                </p>
                <p className="text-[7.5px] font-bold text-black uppercase mt-0.5">
                  ({numberToWords(grandTotal)} Rupees Only)
                </p>
              </div>
              <div className="text-[7px] font-bold uppercase leading-tight italic px-1 border-l border-black text-black">
                नियम: १. विकलेला माल परत घेतला जाणार नाही. २. डिलिव्हरीवेळी माल तपासावा.
              </div>
            </div>

            <div className="w-56 border border-black rounded-lg overflow-hidden text-[8.5px] bg-white text-black">
              <div className="p-1 border-b border-black flex justify-between font-bold text-black uppercase">
                <span>निव्वळ बेरीज (Subtotal)</span>
                <span>₹ {subTotal.toFixed(2)}</span>
              </div>
              {gstType !== 'none' && (
                <div className="p-1 border-b border-black flex justify-between font-bold text-black uppercase">
                  <span>जीएसटी कर (GST {gstRate}%)</span>
                  <span>₹ {gstTotal.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="p-1 border-b border-black flex justify-between font-bold text-black uppercase">
                  <span>सूट (Discount)</span>
                  <span>- ₹ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="p-1 border-t-2 border-b border-black bg-white text-black flex justify-between font-black uppercase tracking-wider text-[9px]">
                <span>अंतिम एकूण (Total)</span>
                <span>₹ {grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-1 flex justify-between font-black uppercase bg-white text-black">
                <span>बाकी रक्कम (Balance)</span>
                <span>
                  ₹ {balance.toLocaleString('en-IN')}
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

      {/* ========================================================================= */}
      {/* 2. PRINTABLE CUTTING MATERIAL SLIP (A4 Half-Size / A5 Format - Ink Saver) */}
      {/* ========================================================================= */}
      {printMode === 'cutting' && (
        <div className="hidden print:block invoice-container bg-white text-black">
          {/* Header */}
          <header className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 relative flex-shrink-0">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" priority unoptimized />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase leading-tight text-black">
                  {shopSettings.shopName}
                </h1>
                <p className="font-black text-[9px] uppercase tracking-wider text-black bg-white px-1.5 py-0.5 inline-block border border-black">
                  WORKSHOP CUTTING SLIP / कटिंग जॉब स्लिप
                </p>
              </div>
            </div>
            <div className="text-right text-[8.5px] font-bold text-black">
              <p className="font-mono">बिल नं: <span className="font-black text-[9px]">{estNo}</span></p>
              <p>तारीख: {date}</p>
            </div>
          </header>

          {/* Customer & Job Metadata */}
          <div className="grid grid-cols-2 gap-2 border border-black p-2 rounded-lg mb-2 text-[9px] font-bold bg-white text-black">
            <div>
              <p className="text-[7.5px] uppercase text-black">ग्राहकाचे नाव:</p>
              <p className="text-xs font-black uppercase text-black">{customerName || 'Walk-in Customer'}</p>
              <p className="text-[8.5px] text-black">गाव/पत्ता: {village || 'Local'}</p>
            </div>
            <div className="text-right">
              <p className="text-[7.5px] uppercase text-black">मोबाईल / WhatsApp:</p>
              <p className="text-xs font-black font-mono text-black">{mobileNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Detailed Cutting Dimensions Table */}
          <table className="w-full table-fixed text-[9px] border-collapse border border-black mb-3 bg-white text-black">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[42%]" />
              <col className="w-[22%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="bg-white border-b-2 border-black text-[8.5px]">
                <th className="p-1 border-r border-black w-7 text-center font-black uppercase">#</th>
                <th className="p-1 pl-2 border-r border-black text-left font-black uppercase">मालाचा तपशील (Particular)</th>
                <th className="p-1 border-r border-black text-center font-black uppercase">कटिंग साईझ (L × W)</th>
                <th className="p-1 border-r border-black text-center font-black uppercase">नग (Qty)</th>
                <th className="p-1 border-r border-black text-center font-black uppercase">फूट (Sqft)</th>
                <th className="p-1 text-center font-black uppercase">तपासणी (✓)</th>
              </tr>
            </thead>
            <tbody className="divide-y border-black">
              {items.map((item, index) => {
                const marathiName = translateMaterialToMarathi(item.particular);
                return (
                  <tr key={item.id} className="text-black">
                    <td className="p-1 border-r border-black text-center font-black text-[8.5px]">{index + 1}</td>
                    <td className="p-1 pl-2 border-r border-black font-black uppercase text-[8.5px] truncate">
                      <span>{item.particular}</span>
                      {marathiName && <span className="ml-1 text-[7.5px] font-bold">({marathiName})</span>}
                      {item.isExtra && <span className="ml-1 text-[7px] lowercase">(नग)</span>}
                    </td>
                    <td className="p-1 border-r border-black text-center font-black text-[9px] font-mono">
                      {!item.isExtra ? `${item.length}" × ${item.width}"` : '-'}
                    </td>
                    <td className="p-1 border-r border-black text-center font-black text-[9px] font-mono">
                      {item.qty} नग
                    </td>
                    <td className="p-1 border-r border-black text-center font-black text-[9px] font-mono">
                      {!item.isExtra ? (item.sqft || 0).toFixed(2) : '-'}
                    </td>
                    <td className="p-1 text-center">
                      <div className="w-4 h-4 border border-black rounded mx-auto"></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Cutting Instructions & Signatures */}
          <div className="border border-black p-2 rounded-lg mb-3 bg-white text-[8px] text-black">
            <span className="font-black uppercase text-[8px] block mb-0.5 text-black">कटर ऑपरेटर महत्वाच्या सूचना (Instructions):</span>
            <ul className="list-disc pl-4 space-y-0.5 font-bold text-black text-[7.5px]">
              <li>कटिंग करण्यापूर्वी लांबी आणि रुंदीचे माप काळजीपूर्वक तपासा (दोनदा मोजा, एकदा कापा).</li>
              <li>ग्राहकाने सांगितलेली पॉलिश किंवा मोल्डिंगची धार तपासा.</li>
            </ul>
          </div>

          <div className="flex justify-between items-end px-4 pt-3 text-black">
            <div className="text-center w-36 border-t border-black pt-1 font-black text-[8px] uppercase">
              कटर ऑपरेटर सही (Cutter)
            </div>
            <div className="text-center w-36 border-t border-black pt-1 font-black text-[8px] uppercase">
              स्टोअर मॅनेजर सही (Manager)
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Image & Document Share Modal */}
      <WhatsAppShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal(prev => ({ ...prev, isOpen: false }))}
        type={shareModal.type}
        data={shareModal.data}
        shopSettings={shopSettings}
        phone={mobileNumber}
        customerName={customerName}
        title={shareModal.title}
        plainTextMessage={shareModal.plainTextMessage}
        onPrint={shareModal.type === 'bill' ? handlePrintInvoice : handlePrintCuttingSlip}
      />
    </motion.div>
  );
}
