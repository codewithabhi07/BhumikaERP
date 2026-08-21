"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { EstimateService, ProductService, KhatabookService, EmployeeService } from '@/lib/api';
import { Estimate, Product, Employee, KhatabookEntry } from '@/types';
import { 
  IndianRupee, 
  History, 
  Package, 
  TrendingUp, 
  Receipt, 
  Plus, 
  AlertCircle, 
  ArrowUpRight, 
  Wallet,
  ArrowRight,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  ShieldCheck,
  Sparkles,
  BookOpen,
  UserCheck,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [khatabook, setKhatabook] = useState<KhatabookEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [estData, prodData, khataData, empData] = await Promise.all([
          EstimateService.getAll(),
          ProductService.getAll(),
          KhatabookService.getAll(),
          EmployeeService.getAll()
        ]);
        setEstimates(estData || []);
        setProducts(prodData || []);
        setKhatabook(khataData || []);
        setEmployees(empData || []);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Strict calculations - unchanged
  const totalSales = estimates.reduce((sum, est) => sum + (est.grandTotal || 0), 0);
  const totalCost = estimates.reduce((sum, est) => sum + (est.totalCost || 0), 0);
  const totalProfit = totalSales - totalCost;
  const totalBalance = estimates.reduce((sum, est) => sum + (est.balance || 0), 0);
  
  const totalTake = khatabook?.filter(e => e.type === 'take').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const lowStockItems = products.filter(p => (p.stock || 0) <= (p.minStock || 5));
  const recentEstimates = estimates.slice(-6).reverse();

  const todayStr = new Date().toLocaleDateString('en-IN');
  const presentToday = employees.filter(e => 
    (e.attendance || []).some(a => a.date === todayStr && a.status === 'present')
  ).length;

  // Monthly revenue trend
  const chartData = useMemo(() => {
    const months: Record<string, { name: string; revenue: number; profit: number }> = {};
    estimates.forEach(est => {
      const parts = (est.date || '').split('/');
      const monthKey = parts.length === 3 ? `${parts[1]}/${parts[2]}` : 'Current';
      if (!months[monthKey]) {
        months[monthKey] = { name: monthKey, revenue: 0, profit: 0 };
      }
      months[monthKey].revenue += est.grandTotal || 0;
      months[monthKey].profit += (est.grandTotal - (est.totalCost || 0)) || 0;
    });
    const result = Object.values(months).slice(-6);
    if (result.length === 0) {
      return [{ name: 'This Month', revenue: totalSales, profit: totalProfit }];
    }
    return result;
  }, [estimates, totalSales, totalProfit]);

  // Top products distribution
  const productData = useMemo(() => {
    const counts: Record<string, number> = {};
    estimates.forEach(est => {
      (est.items || []).forEach(item => {
        if (item.particular) {
          counts[item.particular] = (counts[item.particular] || 0) + 1;
        }
      });
    });
    const entries = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    if (entries.length === 0 && products.length > 0) {
      return products.slice(0, 4).map(p => ({ name: p.name, value: p.stock || 1 }));
    }
    return entries;
  }, [estimates, products]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
              <Sparkles size={11} /> Overview Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Business Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Bhumika Tiles & Building Material • Parola
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link 
            href="/estimate/new" 
            className="btn-primary flex items-center gap-2 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
            <span>Create Bill</span>
          </Link>
          <Link 
            href="/history" 
            className="btn-outline flex items-center gap-2"
          >
            <History size={16} />
            <span>Bill History</span>
          </Link>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            name: 'Total Revenue', 
            value: `₹ ${totalSales.toLocaleString('en-IN')}`, 
            sub: `${estimates.length} Total Bills`,
            icon: IndianRupee, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50 border-emerald-100',
            bar: 'bg-emerald-500'
          },
          { 
            name: 'Net Profit Estimate', 
            value: `₹ ${totalProfit.toLocaleString('en-IN')}`, 
            sub: totalSales > 0 ? `${((totalProfit / totalSales) * 100).toFixed(1)}% margin` : '0% margin',
            icon: ArrowUpRight, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50 border-blue-100',
            bar: 'bg-blue-500'
          },
          { 
            name: 'Khatabook Receivable', 
            value: `₹ ${totalTake.toLocaleString('en-IN')}`, 
            sub: 'Pending from customers',
            icon: Wallet, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50 border-amber-100',
            bar: 'bg-amber-500'
          },
          { 
            name: 'Staff On Duty Today', 
            value: `${presentToday} / ${employees.length}`, 
            sub: `${employees.length} Total Staff Profiles`,
            icon: Users, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50 border-indigo-100',
            bar: 'bg-indigo-500'
          },
        ].map((stat) => (
          <motion.div 
            whileHover={{ y: -3 }}
            key={stat.name} 
            className="erp-card p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 ${stat.bar}`}></div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {stat.name}
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl border ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>{stat.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link 
          href="/estimate/new"
          className="p-3.5 bg-white hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 rounded-2xl flex items-center gap-3 transition-all group shadow-sm"
        >
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Receipt size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Create Bill</p>
            <p className="text-[10px] text-slate-400">Tile / Sqft Billing</p>
          </div>
        </Link>

        <Link 
          href="/products"
          className="p-3.5 bg-white hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 rounded-2xl flex items-center gap-3 transition-all group shadow-sm"
        >
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Stock Inventory</p>
            <p className="text-[10px] text-slate-400">{products.length} Products</p>
          </div>
        </Link>

        <Link 
          href="/khatabook"
          className="p-3.5 bg-white hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 rounded-2xl flex items-center gap-3 transition-all group shadow-sm"
        >
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-amber-700">Khatabook</p>
            <p className="text-[10px] text-slate-400">Credit & Debit</p>
          </div>
        </Link>

        <Link 
          href="/employees"
          className="p-3.5 bg-white hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-300 rounded-2xl flex items-center gap-3 transition-all group shadow-sm"
        >
          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <UserCheck size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Staff Attendance</p>
            <p className="text-[10px] text-slate-400">Quick Daily Log</p>
          </div>
        </Link>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Chart */}
        <div className="lg:col-span-2 erp-card flex flex-col min-h-[380px]">
          <div className="erp-card-header">
            <span className="erp-card-title">
              <BarChart3 size={16} className="text-emerald-600" />
              Monthly Revenue & Profit Trends
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Financial Summary
            </span>
          </div>
          <div className="p-5 flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                  dy={8} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={26} name="Revenue" />
                <Bar dataKey="profit" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={26} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Mix Distribution */}
        <div className="erp-card flex flex-col min-h-[380px]">
          <div className="erp-card-header">
            <span className="erp-card-title">
              <PieChartIcon size={16} className="text-purple-600" />
              Category Popularity
            </span>
          </div>
          <div className="p-5 flex-1 flex flex-col items-center justify-center">
            {productData.length === 0 ? (
              <p className="text-slate-400 text-xs font-bold italic">No product data recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={productData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {productData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [val, 'Count']} />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Live Feed & Stock Shortage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills Feed */}
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 className="erp-card-title">
              <History size={16} className="text-emerald-600" />
              Recent Billing Transactions
            </h3>
            <Link href="/history" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase">
              View All Archive
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Date / Est No</th>
                  <th>Customer</th>
                  <th className="text-right">Total Bill</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEstimates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-400 font-bold italic">
                      No estimates generated yet. Click "Create Bill" to start.
                    </td>
                  </tr>
                ) : (
                  recentEstimates.map((est) => (
                    <tr key={est.id} className="group">
                      <td>
                        <div className="font-bold text-slate-800 text-xs">{est.date}</div>
                        <div className="text-[10px] font-mono text-emerald-600 font-bold uppercase">{est.estNo}</div>
                      </td>
                      <td>
                        <div className="font-bold text-slate-800 text-xs uppercase">{est.customerName || 'Walk-in Customer'}</div>
                        <div className="text-[10px] text-slate-400">{est.mobileNumber || est.village || '-'}</div>
                      </td>
                      <td className="text-right font-black text-slate-800 text-xs sm:text-sm">
                        ₹ {(est.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                          (est.balance || 0) > 0 
                            ? 'bg-red-50 text-red-600 border-red-200' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>
                          {(est.balance || 0) > 0 ? `Due ₹${est.balance}` : 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="erp-card">
          <div className="erp-card-header !bg-amber-50/60 !border-amber-100">
            <h3 className="erp-card-title !text-amber-800">
              <AlertCircle size={16} className="text-amber-600" />
              Stock Shortage & Reorder Alerts
            </h3>
            <Link href="/products" className="text-xs font-bold text-amber-700 hover:text-amber-800 uppercase">
              Manage Stock
            </Link>
          </div>
          <div className="p-4 space-y-2.5">
            {lowStockItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium italic flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <span>All inventory items are currently well-stocked.</span>
              </div>
            ) : (
              lowStockItems.map(p => (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl group hover:bg-amber-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 uppercase">{p.name}</p>
                      <p className="text-[10px] text-amber-700 font-bold uppercase">
                        Current: <span className="font-black text-red-600">{p.stock}</span> (Min: {p.minStock})
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/products" 
                    className="p-2 text-amber-600 hover:text-amber-800 bg-white rounded-lg border border-amber-200 shadow-sm"
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
