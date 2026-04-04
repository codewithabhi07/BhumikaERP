"use client";

import React, { useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Estimate, Product, Employee } from '@/types';
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
  Users
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
  const [estimates] = useLocalStorage<Estimate[]>('bhumi_estimates', []);
  const [products] = useLocalStorage<Product[]>('bhumi_products', []);
  const [khatabook] = useLocalStorage<any[]>('bhumi_khatabook', []);
  const [employees] = useLocalStorage<Employee[]>('bhumi_employees', []);

  // Totals
  const totalSales = estimates.reduce((sum, est) => sum + (est.grandTotal || 0), 0);
  const totalCost = estimates.reduce((sum, est) => sum + (est.totalCost || 0), 0);
  const totalProfit = totalSales - totalCost;
  const totalBalance = estimates.reduce((sum, est) => sum + (est.balance || 0), 0);
  
  const totalTake = khatabook?.filter(e => e.type === 'take').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const lowStockItems = products.filter(p => (p.stock || 0) <= (p.minStock || 5));
  const recentEstimates = estimates.slice(-5).reverse();

  // Toast Notifications for Low Stock
  useEffect(() => {
    if (lowStockItems.length > 0) {
      toast.warning(`${lowStockItems.length} Items are low in stock!`, {
        description: 'Check Stock Inventory for details.',
        action: {
          label: 'View Stock',
          onClick: () => window.location.href = '/products'
        }
      });
    }
  }, [lowStockItems.length]);

  // Analytics: Monthly Sales (Mock groups by date)
  const chartData = useMemo(() => {
    const months: Record<string, { name: string, revenue: number, profit: number }> = {};
    estimates.forEach(est => {
      const parts = est.date.split('/');
      const monthKey = parts.length === 3 ? `${parts[1]}/${parts[2]}` : 'Current';
      if (!months[monthKey]) {
        months[monthKey] = { name: monthKey, revenue: 0, profit: 0 };
      }
      months[monthKey].revenue += est.grandTotal || 0;
      months[monthKey].profit += (est.grandTotal - (est.totalCost || 0)) || 0;
    });
    return Object.values(months).slice(-6);
  }, [estimates]);

  // Analytics: Product Distribution (Top Items)
  const productData = useMemo(() => {
    const counts: Record<string, number> = {};
    estimates.forEach(est => {
      est.items.forEach(item => {
        counts[item.particular] = (counts[item.particular] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [estimates]);

  const COLORS = ['#059669', '#0284c7', '#7c3aed', '#db2777', '#ea580c'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Business Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium italic">Welcome back, Rohit Chavan</p>
        </div>
        <Link href="/estimate/new" className="btn-primary group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          New Transaction
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Total Revenue', value: totalSales, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { name: 'Net Profit', value: totalProfit, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
          { name: 'Pending Balance', value: totalTake, icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-50' },
          { name: 'Active Staff', value: employees.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', suffix: ' Members' },
        ].map((stat, idx) => (
          <motion.div 
            whileHover={{ y: -4 }}
            key={stat.name} 
            className="erp-card p-5 flex items-center gap-4 border-l-4" 
            style={{ borderLeftColor: idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : idx === 2 ? '#f59e0b' : '#6366f1' }}
          >
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.name}</p>
              <p className="text-lg font-black text-slate-800">
                {stat.suffix ? stat.value : `₹ ${stat.value.toLocaleString('en-IN')}`}
                {stat.suffix}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 erp-card h-[400px] flex flex-col">
          <div className="erp-card-header">
            <span className="erp-card-title flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-600" />
              Revenue & Profit Trends
            </span>
          </div>
          <div className="p-6 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} name="Revenue" />
                <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Mix Pie Chart */}
        <div className="erp-card h-[400px] flex flex-col">
          <div className="erp-card-header">
            <span className="erp-card-title flex items-center gap-2">
              <PieChartIcon size={16} className="text-purple-600" />
              Top Selling Categories
            </span>
          </div>
          <div className="p-6 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 className="erp-card-title flex items-center gap-2">
              <History size={16} className="text-emerald-600" />
              Live Feed
            </h3>
            <Link href="/history" className="text-xs font-bold text-emerald-600">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Time / Bill</th>
                  <th>Customer</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentEstimates.map((est) => (
                  <tr key={est.id} className="group">
                    <td>
                      <div className="font-bold">{est.date}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{est.estNo}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-xs">{est.customerName || 'Walk-in'}</div>
                      <div className="text-[10px] text-slate-400">{est.mobileNumber}</div>
                    </td>
                    <td className="text-right font-black text-slate-800">
                      ₹ {est.grandTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="erp-card">
          <div className="erp-card-header !bg-red-50/50">
            <h3 className="erp-card-title !text-red-700 flex items-center gap-2">
              <AlertCircle size={16} />
              Stock Shortage
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-medium italic">All items are sufficiently stocked.</div>
            ) : (
              lowStockItems.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg group hover:bg-red-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center font-black text-xs uppercase shadow-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-red-600 font-black uppercase">Critical: {p.stock} units left</p>
                    </div>
                  </div>
                  <Link href="/products" className="p-2 text-red-400 hover:text-red-700">
                    <ArrowRight size={16} />
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
