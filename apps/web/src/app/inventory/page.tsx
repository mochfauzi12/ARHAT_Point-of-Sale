'use client';
import React, { useState, useEffect } from 'react';
import { fetchProducts, getInventoryMovements, restockProduct, createProduct, uploadImage } from '@/lib/api';
import { Package, Plus, ArrowUpRight, ArrowDownRight, RefreshCw, Upload } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showRestock, setShowRestock] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  // Forms state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [restockQty, setRestockQty] = useState('');
  
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, movs] = await Promise.all([
        fetchProducts(''),
        getInventoryMovements()
      ]);
      setProducts(prods);
      setMovements(movs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await restockProduct(selectedProductId, parseInt(restockQty));
      setShowRestock(false);
      setRestockQty('');
      loadData();
    } catch (err) {
      alert('Failed to restock');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = null;
      if (newProductImage) {
        imageUrl = await uploadImage(newProductImage);
      }
      
      await createProduct({
        name: newProductName,
        sellingPrice: parseFloat(newProductPrice),
        stockQuantity: '0',
        imageUrl: imageUrl
      });
      
      setShowAddProduct(false);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductImage(null);
      loadData();
    } catch (err) {
      alert('Failed to create product');
    }
  };

  if (loading) return <div className="p-8">Loading inventory...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Same as Dashboard ideally, but we'll use a simple nav here */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">ARHAT POS</h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            Dashboard
          </Link>
          <Link href="/pos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            Point of Sale
          </Link>
          <Link href="/inventory" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium transition-colors">
            Inventory
          </Link>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowRestock(true)}
                className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} /> Restock
              </button>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="bg-black text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus size={18} /> New Product
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-6">Current Stock</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-100">
                      <th className="pb-4 font-medium">Product</th>
                      <th className="pb-4 font-medium">Price</th>
                      <th className="pb-4 font-medium">Stock Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                            {p.imageUrl ? (
                              <img src={`http://localhost:8787${p.imageUrl}`} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>☕</span>
                            )}
                          </div>
                          <span className="font-medium">{p.name}</span>
                        </td>
                        <td className="py-4">Rp {parseFloat(p.sellingPrice).toLocaleString('id-ID')}</td>
                        <td className="py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            parseInt(p.stockQuantity) > 10 ? 'bg-green-100 text-green-700' : 
                            parseInt(p.stockQuantity) > 0 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {p.stockQuantity || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
              <h3 className="font-semibold text-lg mb-6">Recent Movements</h3>
              <div className="flex flex-col gap-4">
                {movements.map(m => (
                  <div key={m.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      m.movementType === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {m.movementType === 'in' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{m.productName}</p>
                      <p className="text-sm text-gray-500">
                        {m.movementType === 'in' ? '+' : '-'}{m.quantity} • {m.reason}
                      </p>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {movements.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent movements</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {showRestock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Restock Product</h3>
            <form onSubmit={handleRestock} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select 
                  required
                  value={selectedProductId} 
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  value={restockQty} 
                  onChange={e => setRestockQty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50"
                  placeholder="e.g. 50"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowRestock(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-medium">Restock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">New Product</h3>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  {newProductImage ? (
                    <img src={URL.createObjectURL(newProductImage)} alt="Preview" className="h-32 object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload size={32} className="mb-2" />
                      <span className="text-sm">Click to upload</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setNewProductImage(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  required
                  type="text" 
                  value={newProductName} 
                  onChange={e => setNewProductName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50"
                  placeholder="e.g. Iced Latte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (Rp)</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={newProductPrice} 
                  onChange={e => setNewProductPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50"
                  placeholder="e.g. 25000"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowAddProduct(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-medium">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
