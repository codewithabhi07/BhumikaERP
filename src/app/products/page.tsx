"use client";

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Product } from '@/types';
import { Plus, Trash2, Package, Search, AlertTriangle, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useLocalStorage<Product[]>('bhumi_products', []);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [searchQuery, setSearchQuery] = useState('');

  const addProduct = () => {
    if (!name || !rate || !costPrice) {
      toast.error('Please fill name, rate, and cost price');
      return;
    }
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
    toast.success('Product added to database');
  };

  const deleteProduct = (id: string) => {
    toast('Are you sure you want to delete this product?', {
      action: {
        label: 'Delete',
        onClick: () => {
          setProducts(products.filter(p => p.id !== id));
          toast.success('Product deleted');
        },
      },
    });
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
            {products.filter(p => (p.stock || 0) <= (p.minStock || 0)).length} Low Stock
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
              <label className="erp-label">Product Name</label>
              <input 
                type="text" 
                className="erp-input font-bold"
                placeholder="e.g. 12x18 Wall Tiles"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="erp-label">Cost Price (₹)</label>
                <input 
                  type="number" 
                  className="erp-input font-bold"
                  placeholder="Purchase"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="erp-label">Selling Rate (₹)</label>
                <input 
                  type="number" 
                  className="erp-input font-bold"
                  placeholder="Sale"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="erp-label">Initial Stock</label>
                <input 
                  type="number" 
                  className="erp-input font-bold"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div>
                <label className="erp-label">Min. Alert</label>
                <input 
                  type="number" 
                  className="erp-input font-bold"
                  placeholder="5"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={addProduct}
              className="btn-primary w-full !py-4 uppercase tracking-widest text-xs mt-4 border-b-4 border-emerald-800"
            >
              Save Product
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="bg-transparent outline-none font-bold text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <table className="erp-table">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px]">Product Name</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-center">Stock</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-right">Cost</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-right">Selling</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-right">Profit</th>
                  <th className="p-4 font-black text-gray-400 uppercase text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400 font-bold italic">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const profit = (p.defaultRate || 0) - (p.costPrice || 0);
                    const isLow = (p.stock || 0) <= (p.minStock || 0);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                          <div className="font-bold text-secondary uppercase text-xs">{p.name}</div>
                          {isLow && <div className="text-[9px] text-red-500 font-black uppercase tracking-tighter flex items-center gap-1 mt-1"><AlertTriangle size={10}/> Low Stock</div>}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded font-black text-[10px] uppercase border ${isLow ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium text-slate-400 text-xs">₹ {(p.costPrice || 0).toFixed(2)}</td>
                        <td className="p-4 text-right font-black text-secondary text-xs">₹ {(p.defaultRate || 0).toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <span className="font-black text-emerald-600 text-[10px]">
                            + ₹ {profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
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
