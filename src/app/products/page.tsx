"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ProductService } from '@/lib/api';
import { Product } from '@/types';
import { 
  Plus, 
  Trash2, 
  Package, 
  Search, 
  AlertTriangle, 
  Layers, 
  Box, 
  Wrench, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles,
  Edit2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    ProductService.getAll().then(data => {
      setProducts(data || []);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load products');
      setLoading(false);
    });
  }, []);

  const handleSaveProduct = async () => {
    if (!name.trim() || !rate || !costPrice) {
      toast.error('Please enter product name, selling rate, and cost price');
      return;
    }

    if (editingProduct) {
      // Update existing
      try {
        const updated = await ProductService.update(editingProduct.id, {
          name: name.trim(),
          defaultRate: Number(rate),
          costPrice: Number(costPrice),
          stock: Number(stock) || 0,
          minStock: Number(minStock) || 5
        });
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditingProduct(null);
        resetForm();
        toast.success('Product updated successfully');
      } catch (error) {
        toast.error('Failed to update product');
      }
      return;
    }

    // Create new
    const newProduct: Partial<Product> = {
      name: name.trim(),
      defaultRate: Number(rate),
      costPrice: Number(costPrice),
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 5
    };
    
    try {
      const saved = await ProductService.create(newProduct);
      setProducts([...products, saved]);
      resetForm();
      toast.success('Product added to inventory database');
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setRate(String(p.defaultRate));
    setCostPrice(String(p.costPrice || 0));
    setStock(String(p.stock || 0));
    setMinStock(String(p.minStock || 5));
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setRate('');
    setCostPrice('');
    setStock('');
    setMinStock('5');
  };

  const adjustStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    try {
      const updated = await ProductService.update(product.id, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      toast.success(`Stock updated for ${product.name}: ${newStock} units`);
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const deleteProduct = (id: string) => {
    toast('Delete this product from inventory?', {
      description: 'This will remove the item from quick billing suggestions.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await ProductService.delete(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success('Product removed');
          } catch (error) {
            toast.error('Failed to delete product');
          }
        },
      },
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const lowStockCount = products.filter(p => (p.stock || 0) <= (p.minStock || 5)).length;
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Stock & Product Inventory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage tiles, boards, hardware pricing, and stock replenishment alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="px-4 py-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 flex items-center gap-2 text-xs font-bold shadow-sm">
              <AlertTriangle size={16} className="text-amber-600 animate-pulse" />
              <span>{lowStockCount} Low Stock</span>
            </div>
          )}
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs font-bold shadow-sm">
            <Package size={16} className="text-emerald-600" />
            <span>{products.length} Products ({totalStockUnits} Units)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Add / Edit Product Card */}
        <div className="erp-card p-6 h-fit sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
              <Package size={16} className="text-emerald-600" />
              {editingProduct ? 'Edit Product Details' : 'Add New Product'}
            </h3>
            {editingProduct && (
              <button 
                onClick={resetForm}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase flex items-center gap-1"
              >
                <X size={12} /> Cancel
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="erp-label">Product Name / Specification</label>
              <input 
                type="text" 
                className="erp-input font-bold"
                placeholder="e.g. 12x18 Wall Tiles, 18mm Plywood"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="erp-label">Cost Price (₹)</label>
                <input 
                  type="number" 
                  className="erp-input font-bold"
                  placeholder="Purchase Rate"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="erp-label">Selling Rate (₹)</label>
                <input 
                  type="number" 
                  className="erp-input font-bold"
                  placeholder="Sale Rate"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="erp-label">Current Stock</label>
                <input 
                  type="number" 
                  className="erp-input font-bold"
                  placeholder="Quantity"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div>
                <label className="erp-label">Low Stock Alert</label>
                <input 
                  type="number" 
                  className="erp-input font-bold"
                  placeholder="Threshold (5)"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleSaveProduct}
              className="btn-primary w-full py-3.5 mt-2 uppercase tracking-widest text-xs shadow-lg shadow-emerald-950/20"
            >
              {editingProduct ? 'Update Product' : 'Save Product to Inventory'}
            </button>
          </div>
        </div>

        {/* Right Column: Inventory Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="erp-card overflow-hidden">
            {/* Search toolbar */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search catalog by product name..." 
                className="bg-transparent outline-none font-bold text-xs sm:text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th className="text-center">Stock Level</th>
                    <th className="text-right">Cost</th>
                    <th className="text-right">Selling</th>
                    <th className="text-right">Profit Margin</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center text-slate-400 font-bold italic text-sm">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const profit = (p.defaultRate || 0) - (p.costPrice || 0);
                      const isLow = (p.stock || 0) <= (p.minStock || 5);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td>
                            <div className="font-extrabold text-slate-800 uppercase text-xs sm:text-sm">
                              {p.name}
                            </div>
                            {isLow && (
                              <div className="text-[10px] text-red-600 font-extrabold uppercase tracking-tight flex items-center gap-1 mt-0.5">
                                <AlertTriangle size={11} /> Stock Low (Min: {p.minStock})
                              </div>
                            )}
                          </td>
                          <td className="text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => adjustStock(p, -1)}
                                className="w-5 h-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                                title="Decrease 1"
                              >
                                -
                              </button>
                              <span className={`px-2.5 py-0.5 rounded-full font-black text-xs font-mono border ${
                                isLow ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {p.stock}
                              </span>
                              <button
                                onClick={() => adjustStock(p, 1)}
                                className="w-5 h-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                                title="Increase 1"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="text-right font-medium text-slate-500 text-xs font-mono">
                            ₹ {(p.costPrice || 0).toFixed(2)}
                          </td>
                          <td className="text-right font-black text-slate-900 text-xs sm:text-sm font-mono">
                            ₹ {(p.defaultRate || 0).toFixed(2)}
                          </td>
                          <td className="text-right">
                            <span className="font-black text-emerald-600 text-xs font-mono">
                              + ₹ {profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => startEdit(p)}
                                className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => deleteProduct(p.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
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
        </div>
      </div>
    </div>
  );
}
