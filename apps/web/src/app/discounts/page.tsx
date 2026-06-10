'use client';
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '@/lib/api';
import { Plus, Search, Tag, Edit, Trash2, Calendar } from 'lucide-react';
import { DiscountModal } from '@/components/discounts/DiscountModal';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);

  const fetchDiscounts = async () => {
    try {
      const data = await getDiscounts();
      setDiscounts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSave = async (data: any) => {
    if (editingDiscount) {
      await updateDiscount(editingDiscount.id, data);
    } else {
      await createDiscount(data);
    }
    fetchDiscounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus promo ini? Kasir tidak akan bisa menggunakannya lagi.')) return;
    try {
      await deleteDiscount(id);
      fetchDiscounts();
    } catch (err) {
      alert('Gagal menghapus promo');
    }
  };

  const filtered = discounts.filter(d => 
    d.code.toLowerCase().includes(search.toLowerCase()) || 
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Promo & Diskon</h1>
          <p className="text-slate-500 font-medium">Buat kode promo khusus untuk memotong total belanja pelanggan.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari kode promo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
            />
          </div>
          <button 
            onClick={() => { setEditingDiscount(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Buat Promo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                <th className="p-5 font-bold">Kode Promo</th>
                <th className="p-5 font-bold">Nilai Diskon</th>
                <th className="p-5 font-bold">Syarat Minimum</th>
                <th className="p-5 font-bold">Masa Berlaku</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500 font-medium animate-pulse">Memuat data...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Tag size={32} className="text-slate-300 mb-2" />
                    <span className="font-bold">Belum ada promo</span>
                    <span className="text-sm">Klik "Buat Promo" untuk menambahkan kode diskon baru</span>
                  </td>
                </tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded w-fit border border-slate-200 tracking-widest">{d.code}</span>
                      {d.description && <span className="text-sm text-slate-500 mt-1">{d.description}</span>}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`font-bold ${d.type === 'percentage' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {d.type === 'percentage' ? `${d.value}%` : `Rp ${Number(d.value).toLocaleString('id-ID')}`}
                    </span>
                  </td>
                  <td className="p-5 text-slate-600 text-sm font-medium">
                    {d.minPurchaseAmount && d.minPurchaseAmount !== '0' 
                      ? `Rp ${Number(d.minPurchaseAmount).toLocaleString('id-ID')}` 
                      : 'Tanpa minimum'}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={14} />
                      {(!d.startDate && !d.endDate) ? 'Selamanya' : 
                       `${d.startDate ? new Date(d.startDate).toLocaleDateString('id-ID') : 'Awal'} - ${d.endDate ? new Date(d.endDate).toLocaleDateString('id-ID') : 'Seterusnya'}`}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${d.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {d.isActive ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingDiscount(d); setShowModal(true); }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <DiscountModal
          discount={editingDiscount}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
}
