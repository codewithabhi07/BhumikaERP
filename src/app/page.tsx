"use client";

import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Estimate, Product } from '@/types';
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
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [estimates] = useLocalStorage<Estimate[]>('bhumi_estimates', []);
  const [products] = useLocalStorage<Product[]>('bhumi_products', []);
  const [khatabook] = useLocalStorage<any[]>('bhumi_khatabook', []);

  const totalSales = estimates.reduce((sum, est) => sum + (est.grandTotal || 0), 0);
  const totalCost = estimates.reduce((sum, est) => sum + (est.totalCost || 0), 0);
  const totalProfit = totalSales - totalCost;
  const totalBalance = estimates.reduce((sum, est) => sum + (est.balance || 0), 0);
  
  const totalTake = khatabook?.filter(e => e.type === 'take').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const lowStockItems = products.filter(p => (p.stock || 0) <= (p.minStock || 5));
  const recentEstimates = estimates.slice(-8).reverse();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Business Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Bhumika Plywood & Building Material</p>
        </div>
        <Link href="/estimate/new" className="btn-primary">
          <Plus size={18} />
          Create New Bill
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Total Revenue', value: totalSales, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { name: 'Net Profit', value: totalProfit, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
          { name: 'Khatabook Take', value: totalTake, icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-50' },
          { name: 'Outstanding', value: totalBalance, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat) => (
          <div key={stat.name} className="erp-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.name}</p>
              <p className="text-lg font-bold text-slate-800">₹ {stat.value.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Low Stock Section */}
          {lowStockItems.length > 0 && (
            <div className="erp-card border-red-100 bg-red-50/30">
              <div className="erp-card-header !bg-red-50 border-red-100">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle size={16} />
                  <span className="font-bold text-xs uppercase tracking-wider">Inventory Alerts (Low Stock)</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lowStockItems.map(p => (
                  <Link key={p.id} href="/products" className="bg-white border border-red-100 p-3 rounded flex items-center justify-between hover:bg-red-50 transition-colors">
                    <span className="text-xs font-bold text-slate-700">{p.name}</span>
                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{p.stock} Units</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Estimates Table */}
          <div className="erp-card">
            <div className="erp-card-header">
              <h3 className="erp-card-title flex items-center gap-2">
                <History size={16} className="text-emerald-600" />
                Recent Transactions
              </h3>
              <Link href="/history" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                All History <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Date / Bill No</th>
                    <th>Customer</th>
                    <th className="text-right">Amount</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEstimates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-medium italic">No transactions found.</td>
                    </tr>
                  ) : (
                    recentEstimates.map((est) => (
                      <tr key={est.id}>
                        <td>
                          <div className="font-bold text-slate-800">{est.date}</div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase">{est.estNo}</div>
                        </td>
                        <td>
                          <div className="font-bold text-slate-700 text-xs">{est.customerName || 'Walk-in'}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{est.mobileNumber}</div>
                        </td>
                        <td className="text-right font-bold text-slate-800">
                          ₹ {(est.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            est.balance > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {est.balance > 0 ? 'Partial' : 'Paid'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Shop Card */}
          <div className="erp-card bg-slate-900 text-white p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center border border-white/10">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain invert grayscale brightness-200" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight leading-none">Bhumika Plywood</h2>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Management Console</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sales Record</p>
                <p className="text-2xl font-black tracking-tight">₹ {totalSales.toLocaleString('en-IN')}</p>
              </div>
              <div className="pt-4 border-t border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                <span>STATION: PAROLA-01</span>
                <span>ONLINE</span>
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="erp-card p-6 space-y-4">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-600" />
              Margin Analysis
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profit Margin</p>
                <p className="text-lg font-bold text-slate-800">{totalSales > 0 ? ((totalProfit/totalSales)*100).toFixed(1) : 0}%</p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-1000" 
                  style={{ width: `${totalSales > 0 ? (totalProfit/totalSales)*100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                * Based on recorded cost and sale price data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
