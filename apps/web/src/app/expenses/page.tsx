'use client';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '@/lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'Rent', label: 'Sewa (Rent)' },
  { value: 'Utilities', label: 'Listrik & Air (Utilities)' },
  { value: 'Salary', label: 'Gaji (Salary)' },
  { value: 'Marketing', label: 'Pemasaran (Marketing)' },
  { value: 'Supplies', label: 'Perlengkapan (Supplies)' },
  { value: 'Maintenance', label: 'Perawatan (Maintenance)' },
  { value: 'Other', label: 'Lain-lain (Other)' }
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Other',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses();
      setExpenses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      category: 'Other',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: expense.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) return;
    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, formData);
      } else {
        await createExpense(formData);
      }
      setIsModalOpen(false);
      loadExpenses();
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pengeluaran (Expenses)</h1>
          <p className="text-slate-500 font-medium">Catat pengeluaran operasional untuk menghitung laba bersih.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-black hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
        >
          <Plus size={20} />
          Tambah Pengeluaran
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-slate-500 font-medium animate-pulse">Memuat data...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-slate-400 mb-2">Belum ada catatan pengeluaran</div>
            <p className="text-sm text-slate-500">Klik "Tambah Pengeluaran" untuk mulai mencatat biaya operasional.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-sm">
                  <th className="pb-4 font-medium pl-4">Tanggal</th>
                  <th className="pb-4 font-medium">Kategori</th>
                  <th className="pb-4 font-medium">Catatan</th>
                  <th className="pb-4 font-medium text-right">Jumlah</th>
                  <th className="pb-4 font-medium text-right pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-4 text-slate-900">{formatDate(expense.date)}</td>
                    <td className="py-4 text-slate-900">
                      <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                        {CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500">{expense.notes || '-'}</td>
                    <td className="py-4 text-right font-medium text-slate-900">{formatCurrency(expense.amount)}</td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(expense)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-white rounded-full p-2 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
                <select
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="0"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Catatan</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Deskripsi pengeluaran..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all resize-none"
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-black transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
