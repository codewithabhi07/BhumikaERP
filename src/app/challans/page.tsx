"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { CuttingService, ChallanService, EstimateService, SettingsService } from '@/lib/api';
import { CuttingOrder, DeliveryChallan, Estimate } from '@/types';
import { 
  Scissors, 
  Truck, 
  Printer, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  Building2,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import { translateMaterialToMarathi } from '@/lib/marathi';

export default function ChallansAndCuttingPage() {
  const [activeTab, setActiveTab] = useState<'cutting' | 'challan'>('cutting');
  
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrder[]>([]);
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [cuttingStatusFilter, setCuttingStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [shopSettings, setShopSettings] = useState({
    shopName: 'Bhumika Tiles & Building Material',
    managerName: 'Rohit Chavan',
    phone: '8010060992',
    location: 'Parola, Dist. Jalgaon'
  });

  // Modals & Print State
  const [selectedCuttingOrderForChallan, setSelectedCuttingOrderForChallan] = useState<CuttingOrder | null>(null);
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);

  // Active Print Target
  const [activePrintTarget, setActivePrintTarget] = useState<{
    type: 'cutting_slip' | 'challan_dual';
    data: any;
  } | null>(null);

  // WhatsApp Image Share Modal
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    type: 'cutting' | 'challan';
    data: any;
    title?: string;
    phone?: string;
    customerName?: string;
    plainTextMessage?: string;
  }>({
    isOpen: false,
    type: 'cutting',
    data: null,
  });

  // Form for New Challan
  const [challanNo, setChallanNo] = useState('');
  const [challanEstNo, setChallanEstNo] = useState('');
  const [challanCustomerName, setChallanCustomerName] = useState('');
  const [challanVillage, setChallanVillage] = useState('');
  const [challanMobile, setChallanMobile] = useState('');
  const [challanVehicleNo, setChallanVehicleNo] = useState('');
  const [challanDriverName, setChallanDriverName] = useState('');
  const [challanAddress, setChallanAddress] = useState('');
  const [challanNotes, setChallanNotes] = useState('');
  const [challanItems, setChallanItems] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      CuttingService.getAll(),
      ChallanService.getAll(),
      EstimateService.getAll(),
      SettingsService.get().catch(() => null)
    ]).then(([cuttingData, challanData, estData, settingsData]) => {
      setCuttingOrders(cuttingData || []);
      setChallans(challanData || []);
      setEstimates(estData || []);
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
      toast.error('Failed to load cutting and challan data');
      setLoading(false);
    });
  }, []);

  // Update Cutting Order Status
  const handleToggleCuttingStatus = async (order: CuttingOrder) => {
    const newStatus = order.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toLocaleDateString('en-IN') : undefined;

    try {
      const updated = await CuttingService.update(order.id, {
        status: newStatus,
        completedAt
      });
      setCuttingOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      
      if (newStatus === 'completed') {
        toast.success(`Cutting completed for Bill ${order.estNo}!`, {
          description: 'You can now generate the Delivery Challan.',
          action: {
            label: 'Create Challan',
            onClick: () => openChallanModal(updated)
          }
        });
      } else {
        toast.info(`Status reset to Pending for Bill ${order.estNo}`);
      }
    } catch (error) {
      toast.error('Failed to update cutting status');
    }
  };

  const openChallanModal = (order?: CuttingOrder) => {
    const now = new Date();
    const generatedChallanNo = `DC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    setChallanNo(generatedChallanNo);

    if (order) {
      setSelectedCuttingOrderForChallan(order);
      setChallanEstNo(order.estNo);
      setChallanCustomerName(order.customerName);
      setChallanVillage(order.village || '');
      setChallanMobile(order.mobileNumber || '');
      setChallanAddress(order.village ? `${order.village}, Site Delivery` : 'Site Delivery');
      setChallanVehicleNo('');
      setChallanDriverName('');
      setChallanNotes('');
      setChallanItems((order.items || []).map(it => ({
        id: it.id || Math.random().toString(36).substr(2, 9),
        particular: it.particular,
        length: it.length,
        width: it.width,
        dispatchedQty: it.qty,
        sqft: it.sqft,
        isExtra: it.isExtra
      })));
    } else {
      setSelectedCuttingOrderForChallan(null);
      setChallanEstNo('');
      setChallanCustomerName('');
      setChallanVillage('');
      setChallanMobile('');
      setChallanAddress('');
      setChallanVehicleNo('');
      setChallanDriverName('');
      setChallanNotes('');
      setChallanItems([{
        id: '1',
        particular: '',
        length: 0,
        width: 0,
        dispatchedQty: 1,
        sqft: 0
      }]);
    }

    setShowCreateChallanModal(true);
  };

  const handleSaveChallan = async () => {
    if (!challanCustomerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    const newChallan: Partial<DeliveryChallan> = {
      challanNo,
      estNo: challanEstNo || 'DIRECT-DISPATCH',
      cuttingOrderId: selectedCuttingOrderForChallan?.id,
      date: new Date().toLocaleDateString('en-IN'),
      customerName: challanCustomerName.trim(),
      village: challanVillage.trim(),
      mobileNumber: challanMobile.trim(),
      deliveryAddress: challanAddress.trim(),
      vehicleNo: challanVehicleNo.trim() || 'Direct Pickup',
      driverName: challanDriverName.trim() || 'Customer Transport',
      notes: challanNotes.trim(),
      items: challanItems.filter(it => it.particular && it.particular.trim().length > 0)
    };

    try {
      const saved = await ChallanService.create(newChallan);
      setChallans([saved, ...challans]);
      setShowCreateChallanModal(false);
      toast.success(`Delivery Challan ${challanNo} generated successfully!`);
      
      // Prompt print
      setActivePrintTarget({
        type: 'challan_dual',
        data: saved
      });
      setTimeout(() => {
        window.print();
      }, 200);
    } catch (error) {
      toast.error('Failed to create delivery challan');
    }
  };

  const handleDeleteCuttingOrder = (id: string) => {
    toast('Delete this cutting order?', {
      description: 'The job slip will be removed from workshop log.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await CuttingService.delete(id);
            setCuttingOrders(prev => prev.filter(o => o.id !== id));
            toast.success('Cutting order deleted');
          } catch (error) {
            toast.error('Failed to delete cutting order');
          }
        }
      }
    });
  };

  const handleDeleteChallan = (id: string) => {
    toast('Delete this delivery challan?', {
      description: 'The dispatch record will be permanently deleted.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await ChallanService.delete(id);
            setChallans(prev => prev.filter(c => c.id !== id));
            toast.success('Challan record deleted');
          } catch (error) {
            toast.error('Failed to delete challan');
          }
        }
      }
    });
  };

  const printCuttingSlipDirect = (order: CuttingOrder) => {
    setActivePrintTarget({
      type: 'cutting_slip',
      data: order
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const printChallanDirect = (challan: DeliveryChallan) => {
    setActivePrintTarget({
      type: 'challan_dual',
      data: challan
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleWhatsAppCutting = (order: CuttingOrder) => {
    const message = `*BHUMIKA TILES - WORKSHOP CUTTING SLIP (कटिंग स्लिप)*\n*Bill No:* ${order.estNo}\n*Customer:* ${order.customerName}\n*Date:* ${order.date}\n*Site:* ${order.village || 'Local'}\n---------------------------\n*CUTTING MEASUREMENTS & SIZES:*\n${(order.items || []).map((it, idx) => `${idx + 1}. *${it.particular}*\n   Size: ${!it.isExtra ? `${it.length}" × ${it.width}" (${it.sqft} Sqft)` : `Hardware / Unit`}\n   Quantity: ${it.qty} Pcs`).join('\n')}\n---------------------------\n*Cutting Status:* ${order.status === 'completed' ? 'COMPLETED / READY' : 'IN WORKSHOP'}\nThank you!`;

    setShareModal({
      isOpen: true,
      type: 'cutting',
      data: order,
      title: `Share Workshop Cutting Slip (${order.estNo}) on WhatsApp`,
      phone: order.mobileNumber,
      customerName: order.customerName,
      plainTextMessage: message,
    });
  };

  const handleWhatsAppChallan = (challan: DeliveryChallan) => {
    const message = `*BHUMIKA TILES & BUILDING MATERIAL*\n*DELIVERY DISPATCH CHALLAN (डिलिव्हरी चलन)*\n*Challan No:* ${challan.challanNo}\n*Bill Ref:* ${challan.estNo}\n*Date:* ${challan.date}\n*Customer:* ${challan.customerName}\n*Vehicle / Transport:* ${challan.vehicleNo || 'Direct Pickup'} (Driver: ${challan.driverName || '-'})\n---------------------------\n*DISPATCHED GOODS:*\n${(challan.items || []).map((it, idx) => `${idx + 1}. ${it.particular} - Qty: ${it.dispatchedQty} Pcs ${!it.isExtra ? `(${it.length}x${it.width} = ${it.sqft} Sqft)` : ''}`).join('\n')}\n---------------------------\nYour material has been dispatched safely from Bhumika Tiles, Parola. Please verify upon unloading.\nThank you!`;

    setShareModal({
      isOpen: true,
      type: 'challan',
      data: challan,
      title: `Share Delivery Challan (${challan.challanNo}) on WhatsApp`,
      phone: challan.mobileNumber,
      customerName: challan.customerName,
      plainTextMessage: message,
    });
  };

  // Filtered cutting orders
  const filteredCuttingOrders = useMemo(() => {
    return cuttingOrders.filter(order => {
      const match = 
        (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.estNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.mobileNumber || '').includes(searchQuery) ||
        (order.village || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      if (cuttingStatusFilter === 'pending') return match && order.status !== 'completed';
      if (cuttingStatusFilter === 'completed') return match && order.status === 'completed';
      return match;
    });
  }, [cuttingOrders, searchQuery, cuttingStatusFilter]);

  // Filtered challans
  const filteredChallans = useMemo(() => {
    return challans.filter(c => 
      (c.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.challanNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.estNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.vehicleNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.mobileNumber || '').includes(searchQuery)
    );
  }, [challans, searchQuery]);

  const pendingCuttingCount = cuttingOrders.filter(o => o.status !== 'completed').length;
  const completedCuttingCount = cuttingOrders.filter(o => o.status === 'completed').length;

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Cutting & Challan Manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
              <Truck size={12} /> Workshop & Logistics System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Cutting Material & Delivery Challans
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage workshop cutting orders, verify sizes, and generate dual-copy delivery challans
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openChallanModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Delivery Challan</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('cutting')}
            className={clsx(
              "py-3 px-4 font-black text-xs sm:text-sm uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all",
              activeTab === 'cutting'
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            )}
          >
            <Scissors size={16} />
            <span>Workshop Cutting Slips</span>
            {pendingCuttingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                {pendingCuttingCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('challan')}
            className={clsx(
              "py-3 px-4 font-black text-xs sm:text-sm uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all",
              activeTab === 'challan'
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            )}
          >
            <Truck size={16} />
            <span>Delivery Challans (डिलिव्हरी चलन)</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold">
              {challans.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WORKSHOP CUTTING ORDERS (कटिंग मटेरियल स्लिप्स) */}
      {/* ========================================================================= */}
      {activeTab === 'cutting' && (
        <div className="space-y-6 no-print">
          {/* Summary & Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search cutting jobs by bill no, customer, phone..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
              {[
                { id: 'all', label: `All Jobs (${cuttingOrders.length})` },
                { id: 'pending', label: `Pending (${pendingCuttingCount})` },
                { id: 'completed', label: `Completed (${completedCuttingCount})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCuttingStatusFilter(tab.id as any)}
                  className={clsx(
                    "flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all",
                    cuttingStatusFilter === tab.id 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cutting Orders Grid / Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredCuttingOrders.length === 0 ? (
              <div className="col-span-full erp-card p-16 text-center text-slate-400 font-bold italic text-sm">
                No cutting orders found. Cutting slips are automatically created whenever you create a bill with measurements.
              </div>
            ) : (
              filteredCuttingOrders.map((order) => {
                const isDone = order.status === 'completed';
                return (
                  <motion.div 
                    whileHover={{ y: -2 }}
                    key={order.id} 
                    className="erp-card p-5 sm:p-6 space-y-4 border-l-4 flex flex-col justify-between"
                    style={{ borderLeftColor: isDone ? '#10b981' : '#f59e0b' }}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-800 uppercase bg-slate-100 px-2 py-0.5 rounded">
                              {order.estNo}
                            </span>
                            <span className="text-[11px] text-slate-400 font-semibold font-mono">
                              {order.date}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mt-1.5">
                            {order.customerName || 'Walk-in Customer'}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                            <span className="flex items-center gap-1 font-mono"><Phone size={11}/> {order.mobileNumber || 'N/A'}</span>
                            {order.village && <span>• {order.village}</span>}
                          </div>
                        </div>

                        {/* Status Toggle Badge */}
                        <button
                          onClick={() => handleToggleCuttingStatus(order)}
                          className={clsx(
                            "px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm",
                            isDone 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" 
                              : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                          )}
                          title="Click to toggle status"
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              <span>Cutting Done</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} className="text-amber-600 animate-spin" />
                              <span>In Workshop</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Items Dimension Table */}
                      <div className="pt-3">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                          Cutting Specifications (LxW Sizes):
                        </p>
                        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                          <table className="w-full">
                            <thead className="bg-slate-800 text-slate-200 text-[10px] uppercase">
                              <tr>
                                <th className="p-2 text-left">Material</th>
                                <th className="p-2 text-center">Cut Size (LxW)</th>
                                <th className="p-2 text-center">Qty</th>
                                <th className="p-2 text-right">Sqft</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(order.items || []).map((it, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-2 font-bold text-slate-800 uppercase">{it.particular}</td>
                                  <td className="p-2 text-center font-mono font-bold text-slate-700">
                                    {!it.isExtra ? `${it.length}" × ${it.width}"` : '-'}
                                  </td>
                                  <td className="p-2 text-center font-mono font-bold">{it.qty} Pcs</td>
                                  <td className="p-2 text-right font-mono font-extrabold text-emerald-700">
                                    {!it.isExtra ? (it.sqft || 0).toFixed(2) : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => printCuttingSlipDirect(order)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                          title="Print Workshop Cutting Slip"
                        >
                          <Printer size={13} />
                          <span>Print Slip</span>
                        </button>
                        <button
                          onClick={() => handleWhatsAppCutting(order)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200"
                          title="WhatsApp Cutting Sizes"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openChallanModal(order)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
                          title="Create Delivery Challan from this order"
                        >
                          <Truck size={13} />
                          <span>Generate Challan</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCuttingOrder(order.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DELIVERY CHALLANS (डिलिव्हरी चलन) */}
      {/* ========================================================================= */}
      {activeTab === 'challan' && (
        <div className="space-y-6 no-print">
          {/* Search & Actions Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search challans by number, customer, vehicle..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Total Dispatches: <span className="text-slate-900 font-black">{challans.length}</span>
              </span>
            </div>
          </div>

          {/* Challans Table Card */}
          <div className="erp-card">
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Challan No / Date</th>
                    <th>Customer & Site Address</th>
                    <th>Vehicle / Driver</th>
                    <th className="text-center">Items Dispatched</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredChallans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-slate-400 font-bold italic text-sm">
                        No delivery challans recorded yet. Click "New Delivery Challan" or generate from cutting jobs.
                      </td>
                    </tr>
                  ) : (
                    filteredChallans.map((challan) => (
                      <tr key={challan.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td>
                          <div className="font-mono font-black text-emerald-700 text-xs sm:text-sm uppercase">
                            {challan.challanNo}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {challan.date} • Bill: <span className="font-mono">{challan.estNo}</span>
                          </div>
                        </td>
                        <td>
                          <div className="font-extrabold text-slate-800 uppercase text-xs sm:text-sm">
                            {challan.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {challan.mobileNumber || ''} {challan.deliveryAddress ? `• ${challan.deliveryAddress}` : ''}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase font-mono">
                            <Truck size={13} className="text-emerald-600" />
                            <span>{challan.vehicleNo || 'Direct Transport'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">
                            Driver: {challan.driverName || 'Self Pickup'}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs">
                            {(challan.items || []).length} Items
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => printChallanDirect(challan)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                              title="Print Dual Copy (Customer + Store Copy)"
                            >
                              <Printer size={13} />
                              <span>Print Dual Copy</span>
                            </button>
                            <button
                              onClick={() => handleWhatsAppChallan(challan)}
                              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-200"
                              title="WhatsApp Delivery Challan"
                            >
                              <MessageCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteChallan(challan.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                              title="Delete Challan"
                            >
                              <Trash2 size={14} />
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
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE DELIVERY CHALLAN */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showCreateChallanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8"
            >
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Truck size={18} className="text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Create Delivery Dispatch Challan (डिलिव्हरी चलन)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Challan No: {challanNo}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateChallanModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="erp-label">Customer Name</label>
                    <input 
                      type="text" 
                      value={challanCustomerName} 
                      onChange={e => setChallanCustomerName(e.target.value)} 
                      className="erp-input font-bold" 
                      placeholder="Customer Name" 
                    />
                  </div>
                  <div>
                    <label className="erp-label">Mobile Number</label>
                    <input 
                      type="text" 
                      value={challanMobile} 
                      onChange={e => setChallanMobile(e.target.value)} 
                      className="erp-input font-mono font-bold" 
                      placeholder="10-digit phone" 
                    />
                  </div>
                  <div>
                    <label className="erp-label">Vehicle / Transport No</label>
                    <input 
                      type="text" 
                      value={challanVehicleNo} 
                      onChange={e => setChallanVehicleNo(e.target.value)} 
                      className="erp-input font-mono font-bold uppercase" 
                      placeholder="e.g. MH-19 BM 4421 / Auto" 
                    />
                  </div>
                  <div>
                    <label className="erp-label">Driver / Porter Name</label>
                    <input 
                      type="text" 
                      value={challanDriverName} 
                      onChange={e => setChallanDriverName(e.target.value)} 
                      className="erp-input font-bold" 
                      placeholder="e.g. Raju Patil" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="erp-label">Delivery Site Address / Location</label>
                    <input 
                      type="text" 
                      value={challanAddress} 
                      onChange={e => setChallanAddress(e.target.value)} 
                      className="erp-input" 
                      placeholder="e.g. Lasur road site, Parola" 
                    />
                  </div>
                </div>

                {/* Items to Dispatch */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="erp-label !mb-0">Dispatched Material Items</label>
                    <button
                      type="button"
                      onClick={() => setChallanItems([...challanItems, { id: Math.random().toString(36).substr(2, 9), particular: '', length: 0, width: 0, dispatchedQty: 1, sqft: 0 }])}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 uppercase"
                    >
                      <Plus size={13} /> Add Item
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full">
                      <thead className="bg-slate-800 text-slate-200 text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5 text-left">Item Description</th>
                          <th className="p-2.5 text-center w-28">Size (LxW)</th>
                          <th className="p-2.5 text-center w-24">Dispatch Qty</th>
                          <th className="p-2.5 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {challanItems.map((item, index) => (
                          <tr key={item.id}>
                            <td className="p-2">
                              <input 
                                type="text"
                                value={item.particular}
                                onChange={e => {
                                  const updated = [...challanItems];
                                  updated[index].particular = e.target.value;
                                  setChallanItems(updated);
                                }}
                                className="w-full bg-transparent font-bold text-xs outline-none"
                                placeholder="Item name..."
                              />
                            </td>
                            <td className="p-2 text-center">
                              <span className="font-mono">
                                {item.length && item.width ? `${item.length}" × ${item.width}"` : '-'}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <input 
                                type="number"
                                value={item.dispatchedQty}
                                onChange={e => {
                                  const updated = [...challanItems];
                                  updated[index].dispatchedQty = Number(e.target.value);
                                  setChallanItems(updated);
                                }}
                                className="w-16 bg-slate-100 rounded p-1 text-center font-bold font-mono outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setChallanItems(challanItems.filter((_, i) => i !== index))}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateChallanModal(false)}
                    className="btn-outline text-xs uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChallan}
                    className="btn-primary text-xs uppercase font-black tracking-wider flex items-center gap-2"
                  >
                    <Save size={15} /> Save & Print Dual Copy
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* PRINT LAYOUT: 1. DUAL COPY DELIVERY CHALLAN (Customer Copy + Office Copy - Ink Saver) */}
      {/* ========================================================================= */}
      {activePrintTarget?.type === 'challan_dual' && (
        <div className="hidden print:block invoice-container bg-white text-black">
          {/* COPY 1: CUSTOMER COPY (ग्राहक प्रत) */}
          <div className="border border-black p-2.5 rounded-lg mb-3 relative bg-white text-black">
            <div className="absolute right-2 top-2 border-2 border-black bg-white text-black text-[8px] font-black px-2 py-0.5 uppercase tracking-wider rounded">
              CUSTOMER COPY / ग्राहक प्रत
            </div>

            <header className="flex justify-between items-start border-b border-black pb-1.5 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 relative flex-shrink-0">
                  <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" priority unoptimized />
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase leading-none mb-0.5 text-black">
                    {shopSettings.shopName}
                  </h1>
                  <p className="font-extrabold text-[8px] uppercase tracking-wider text-black">
                    DELIVERY DISPATCH CHALLAN / डिलिव्हरी चलन
                  </p>
                  <p className="text-[7.5px] font-bold text-black">{shopSettings.location} (पारोळा) • मो.: {shopSettings.phone}</p>
                </div>
              </div>
              <div className="text-right text-[8px] font-bold pr-20 text-black">
                <p className="font-mono">चलन नं: <span className="font-black text-[9px]">{activePrintTarget.data.challanNo}</span></p>
                <p>तारीख: {activePrintTarget.data.date}</p>
                <p className="font-mono">बिल नं: {activePrintTarget.data.estNo}</p>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-2 text-[8.5px] font-bold mb-2 border border-black p-1.5 rounded bg-white text-black">
              <div>
                <p className="text-[7px] uppercase text-black">ग्राहकाचे नाव (Delivered To):</p>
                <p className="text-xs font-black uppercase text-black">{activePrintTarget.data.customerName}</p>
                <p className="text-[8px] text-black">पत्ता/साईट: {activePrintTarget.data.deliveryAddress || activePrintTarget.data.village || 'Site'}</p>
                <p className="text-[8px] font-mono text-black">मोबाईल: {activePrintTarget.data.mobileNumber || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] uppercase text-black">गाडी व ड्रायव्हर (Transport):</p>
                <p className="text-[9px] font-black font-mono uppercase text-black">{activePrintTarget.data.vehicleNo || 'Direct Handover'}</p>
                <p className="text-[8px] text-black">ड्रायव्हर: {activePrintTarget.data.driverName || 'Self'}</p>
              </div>
            </div>

            <table className="w-full table-fixed text-[8.5px] border-collapse border border-black mb-2 bg-white text-black">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[44%]" />
                <col className="w-[22%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="bg-white border-b-2 border-black text-[8px] uppercase">
                  <th className="p-1 border-r border-black text-center font-black">#</th>
                  <th className="p-1 pl-2 border-r border-black text-left font-black">मालाचा तपशील (Description)</th>
                  <th className="p-1 border-r border-black text-center font-black">साईझ (LxW)</th>
                  <th className="p-1 border-r border-black text-center font-black">नग (Qty)</th>
                  <th className="p-1 pr-1.5 text-right font-black">फूट (Sqft)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-black">
                {(activePrintTarget.data.items || []).map((it: any, index: number) => {
                  const marathiName = translateMaterialToMarathi(it.particular);
                  return (
                    <tr key={index} className="text-black">
                      <td className="p-0.5 border-r border-black text-center font-bold">{index + 1}</td>
                      <td className="p-0.5 pl-2 border-r border-black font-black uppercase truncate">
                        <span>{it.particular}</span>
                        {marathiName && <span className="ml-1 text-[7px] font-bold">({marathiName})</span>}
                      </td>
                      <td className="p-0.5 border-r border-black text-center font-bold font-mono">
                        {!it.isExtra && it.length && it.width ? `${it.length}" × ${it.width}"` : '-'}
                      </td>
                      <td className="p-0.5 border-r border-black text-center font-black font-mono">{it.dispatchedQty} नग</td>
                      <td className="p-0.5 pr-1.5 text-right font-black font-mono">{it.sqft ? it.sqft.toFixed(2) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-between items-end px-2 pt-2 text-[8px] font-black uppercase text-black">
              <div className="text-center w-36 border-t border-black pt-0.5">
                माल घेणाऱ्याची सही (Receiver)
              </div>
              <div className="text-center w-36 border-t border-black pt-0.5">
                अधिकृत सही (Dispatcher)
              </div>
            </div>
          </div>

          {/* DOTTED CUT LINE */}
          <div className="border-t border-dashed border-black my-2 text-center relative">
            <span className="bg-white px-2 text-[7px] uppercase font-bold text-black -top-2 relative">
              ✂ Tear / Cut Line (कापण्याची रेषा) ✂
            </span>
          </div>

          {/* COPY 2: STORE / OFFICE COPY (ऑफिस / दुकान प्रत - Ink Saver) */}
          <div className="border border-black p-2.5 rounded-lg relative bg-white text-black">
            <div className="absolute right-2 top-2 border-2 border-black bg-white text-black text-[8px] font-black px-2 py-0.5 uppercase tracking-wider rounded">
              OFFICE COPY / दुकान प्रत
            </div>

            <header className="flex justify-between items-start border-b border-black pb-1.5 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 relative flex-shrink-0">
                  <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" priority unoptimized />
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase leading-none mb-0.5 text-black">
                    {shopSettings.shopName}
                  </h1>
                  <p className="font-extrabold text-[8px] uppercase tracking-wider text-black">
                    DELIVERY DISPATCH CHALLAN / डिलिव्हरी चलन
                  </p>
                  <p className="text-[7.5px] font-bold text-black">{shopSettings.location} (पारोळा) • मो.: {shopSettings.phone}</p>
                </div>
              </div>
              <div className="text-right text-[8px] font-bold pr-20 text-black">
                <p className="font-mono">चलन नं: <span className="font-black text-[9px]">{activePrintTarget.data.challanNo}</span></p>
                <p>तारीख: {activePrintTarget.data.date}</p>
                <p className="font-mono">बिल नं: {activePrintTarget.data.estNo}</p>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-2 text-[8.5px] font-bold mb-2 border border-black p-1.5 rounded bg-white text-black">
              <div>
                <p className="text-[7px] uppercase text-black">ग्राहकाचे नाव (Delivered To):</p>
                <p className="text-xs font-black uppercase text-black">{activePrintTarget.data.customerName}</p>
                <p className="text-[8px] text-black">पत्ता/साईट: {activePrintTarget.data.deliveryAddress || activePrintTarget.data.village || 'Site'}</p>
                <p className="text-[8px] font-mono text-black">मोबाईल: {activePrintTarget.data.mobileNumber || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] uppercase text-black">गाडी व ड्रायव्हर (Transport):</p>
                <p className="text-[9px] font-black font-mono uppercase text-black">{activePrintTarget.data.vehicleNo || 'Direct Transport'}</p>
                <p className="text-[8px] text-black">ड्रायव्हर: {activePrintTarget.data.driverName || 'Self'}</p>
              </div>
            </div>

            <table className="w-full table-fixed text-[8.5px] border-collapse border border-black mb-2 bg-white text-black">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[44%]" />
                <col className="w-[22%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="bg-white border-b-2 border-black text-[8px] uppercase">
                  <th className="p-1 border-r border-black text-center font-black">#</th>
                  <th className="p-1 pl-2 border-r border-black text-left font-black">मालाचा तपशील (Description)</th>
                  <th className="p-1 border-r border-black text-center font-black">साईझ (LxW)</th>
                  <th className="p-1 border-r border-black text-center font-black">नग (Qty)</th>
                  <th className="p-1 pr-1.5 text-right font-black">फूट (Sqft)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-black">
                {(activePrintTarget.data.items || []).map((it: any, index: number) => {
                  const marathiName = translateMaterialToMarathi(it.particular);
                  return (
                    <tr key={index} className="text-black">
                      <td className="p-0.5 border-r border-black text-center font-bold">{index + 1}</td>
                      <td className="p-0.5 pl-2 border-r border-black font-black uppercase truncate">
                        <span>{it.particular}</span>
                        {marathiName && <span className="ml-1 text-[7px] font-bold">({marathiName})</span>}
                      </td>
                      <td className="p-0.5 border-r border-black text-center font-bold font-mono">
                        {!it.isExtra && it.length && it.width ? `${it.length}" × ${it.width}"` : '-'}
                      </td>
                      <td className="p-0.5 border-r border-black text-center font-black font-mono">{it.dispatchedQty} नग</td>
                      <td className="p-0.5 pr-1.5 text-right font-black font-mono">{it.sqft ? it.sqft.toFixed(2) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-between items-end px-2 pt-2 text-[8px] font-black uppercase text-black">
              <div className="text-center w-36 border-t border-black pt-0.5">
                ड्रायव्हर सही (Driver)
              </div>
              <div className="text-center w-36 border-t border-black pt-0.5">
                स्टोअर मॅनेजर सही (Manager)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINT LAYOUT: 2. WORKSHOP CUTTING SLIP (A4 Half-Size / A5 Format - Ink Saver) */}
      {/* ========================================================================= */}
      {activePrintTarget?.type === 'cutting_slip' && (
        <div className="hidden print:block invoice-container bg-white text-black">
          <header className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
            <div className="flex items-center gap-2">
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
              <p className="font-mono">बिल नं: <span className="font-black text-[9px]">{activePrintTarget.data.estNo}</span></p>
              <p>तारीख: {activePrintTarget.data.date}</p>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-2 border border-black p-2 rounded-lg mb-2 text-[9px] font-bold bg-white text-black">
            <div>
              <p className="text-[7.5px] uppercase text-black">ग्राहकाचे नाव:</p>
              <p className="text-xs font-black uppercase text-black">{activePrintTarget.data.customerName || 'Walk-in Customer'}</p>
              <p className="text-[8.5px] text-black">गाव/पत्ता: {activePrintTarget.data.village || 'Local'}</p>
            </div>
            <div className="text-right">
              <p className="text-[7.5px] uppercase text-black">मोबाईल / WhatsApp:</p>
              <p className="text-xs font-black font-mono text-black">{activePrintTarget.data.mobileNumber || 'N/A'}</p>
            </div>
          </div>

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
              {(activePrintTarget.data.items || []).map((item: any, index: number) => {
                const marathiName = translateMaterialToMarathi(item.particular);
                return (
                  <tr key={index} className="text-black">
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

      {/* WhatsApp Image Share Modal */}
      {shareModal.isOpen && (
        <WhatsAppShareModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal(prev => ({ ...prev, isOpen: false }))}
          type={shareModal.type}
          data={shareModal.data}
          shopSettings={shopSettings}
          phone={shareModal.phone}
          customerName={shareModal.customerName}
          title={shareModal.title}
          plainTextMessage={shareModal.plainTextMessage}
          onPrint={() => {
            if (shareModal.type === 'cutting') {
              printCuttingSlipDirect(shareModal.data);
            } else {
              printChallanDirect(shareModal.data);
            }
          }}
        />
      )}
    </div>
  );
}
