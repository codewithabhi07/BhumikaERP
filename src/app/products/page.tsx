"use client";

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Product } from '@/types';
import { Plus, Trash2, Package, Search, AlertTriangle, TrendingDown } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useLocalStorage<Product[]>('bhumi_products', []);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [searchQuery, setSearchQuery] = useState('');

  const addProduct = () => {
    if (!name || !rate || !costPrice) return;
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      defaultRate: Number(rate),
      costPrice: Number(costPrice),
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 5
    };
    setProducts([...products, newProduct]);
    setName('');
    setRate('');
    setCostPrice('');
    setStock('');
    setMinStock('5');
  };

  const deleteProduct = (id: string) => {
    if (confirm('Delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-secondary tracking-tight">Product Database</h1>
        <div className="flex gap-4">
          <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-orange-100">
            <AlertTriangle size={18} />
            {products.filter(p => p.stock <= p.minStock).length} Low Stock
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-emerald-100">
            <Package size={18} />
            {products.length} Items
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-black text-secondary uppercase text-[10px] tracking-widest mb-6 border-b border-gray-100 pb-2">Add New Product</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block ml-1">Product Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold text-secondary transition-all"
                placeholder="e.g. 18mm Plywood"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block ml-1">Cost Price (₹)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-secondary"
                  placeholder="Purchase Rate"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block ml-1">Selling Rate (₹)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-secondary"
                  placeholder="Sale Rate"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block ml-1">Initial Stock</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-secondary"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block ml-1">Min. Alert</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-secondary"
                  placeholder="5"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={addProduct}
              className="w-full bg-primary text-white p-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-lg active:scale-95 mt-4"
            >
              Save Product
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by product name..." 
                className="bg-transparent outline-none font-bold text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px]">Product Name</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-center">Stock Level</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-right">Cost (₹)</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-right">Selling (₹)</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-right">Profit/Unit</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400 font-bold italic">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const profit = p.defaultRate - p.costPrice;
                    const isLow = p.stock <= p.minStock;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                          <div className="font-bold text-secondary">{p.name}</div>
                          {isLow && <div className="text-[9px] text-red-500 font-black uppercase tracking-tighter flex items-center gap-1 mt-1"><AlertTriangle size={10}/> Restock Immediately</div>}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase ${isLow ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium text-gray-400">₹ {(p.costPrice || 0).toFixed(2)}</td>
                        <td className="p-4 text-right font-black text-secondary">₹ {(p.defaultRate || 0).toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <span className="font-black text-emerald-500 text-[10px] bg-emerald-50 px-2 py-1 rounded">
                            + ₹ {(p.defaultRate - (p.costPrice || 0)).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
