'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, PackageOpen } from 'lucide-react';
import { fetchRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial } from '@/lib/api';

interface RawMaterial {
  id: string;
  name: string;
  sku: string;
  unit: string;
  costPerUnit: string;
  stockQuantity: string;
}

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', sku: '', unit: 'gram', costPerUnit: '0', initialStock: '0' });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRawMaterials();
      setMaterials(data);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRawMaterial(editingId, {
          name: formData.name,
          sku: formData.sku,
          unit: formData.unit,
          costPerUnit: formData.costPerUnit,
        });
      } else {
        await createRawMaterial({
          ...formData,
          // Assuming the first outlet ID is used for MVP if we need initial stock
          // But initialStock logic is mostly for UI demonstration here
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      loadData();
    } catch (err) {
      alert('Failed to save raw material');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus bahan baku ini?')) {
      try {
        await deleteRawMaterial(id);
        loadData();
      } catch (err) {
        alert('Failed to delete raw material');
      }
    }
  };

  const openEdit = (m: RawMaterial) => {
    setEditingId(m.id);
    setFormData({
      name: m.name,
      sku: m.sku || '',
      unit: m.unit,
      costPerUnit: m.costPerUnit || '0',
      initialStock: '0' // We don't edit stock from here, just master data
    });
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', unit: 'gram', costPerUnit: '0', initialStock: '0' });
    setIsModalOpen(true);
  };

  const filtered = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || (m.sku && m.sku.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bahan Baku & Komposisi</h1>
          <p className="text-slate-500 mt-1">Kelola stok master bahan baku, packaging, dan material (BOM) untuk berbagai jenis usaha.</p>
        </div>
        <button 
          onClick={openNew}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Tambah Bahan Baku
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama bahan baku atau SKU..."
            className="w-full bg-transparent border-none focus:outline-none text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Bahan</th>
                <th className="px-6 py-4">SKU / Kode</th>
                <th className="px-6 py-4">Sisa Stok</th>
                <th className="px-6 py-4">Satuan (Unit)</th>
                <th className="px-6 py-4">HPP per Unit</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <PackageOpen size={48} className="mb-4 opacity-50" />
                      <p className="font-semibold text-lg">Belum ada bahan baku</p>
                      <p className="text-sm">Klik "Tambah Bahan Baku" untuk memulai pencatatan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{m.name}</td>
                    <td className="px-6 py-4 text-slate-500">{m.sku || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`font-black ${parseFloat(m.stockQuantity) <= 0 ? 'text-rose-500' : 'text-teal-600'}`}>
                        {parseFloat(m.stockQuantity).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{m.unit}</td>
                    <td className="px-6 py-4 text-slate-600">Rp {parseFloat(m.costPerUnit || '0').toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingId ? 'Edit Bahan Baku' : 'Bahan Baku Baru'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Bahan / Komponen</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-slate-200 rounded-xl focus:ring-teal-500 focus:border-teal-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Biji Kopi Arabica, Botol Plastik..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">SKU / Kode (Opsional)</label>
                  <input 
                    type="text" 
                    className="w-full border-slate-200 rounded-xl focus:ring-teal-500 focus:border-teal-500"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Satuan Ukur</label>
                  <select 
                    className="w-full border-slate-200 rounded-xl focus:ring-teal-500 focus:border-teal-500"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="gram">Gram (g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ml">Mililiter (ml)</option>
                    <option value="liter">Liter (L)</option>
                    <option value="pcs">Pieces (Pcs)</option>
                    <option value="cm">Centimeter (cm)</option>
                    <option value="porsi">Porsi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">HPP per {formData.unit} (Rp)</label>
                <input 
                  type="number" 
                  className="w-full border-slate-200 rounded-xl focus:ring-teal-500 focus:border-teal-500"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({...formData, costPerUnit: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-1">Biaya modal per {formData.unit}. Digunakan untuk kalkulasi margin produk.</p>
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Stok Awal</label>
                  <input 
                    type="number" 
                    className="w-full border-slate-200 rounded-xl focus:ring-teal-500 focus:border-teal-500 bg-slate-50"
                    value={formData.initialStock}
                    onChange={(e) => setFormData({...formData, initialStock: e.target.value})}
                  />
                </div>
              )}

              <div className="flex gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 flex items-center justify-center gap-2">
                  <Save size={18} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
