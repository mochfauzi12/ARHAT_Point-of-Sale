import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DiscountModalProps {
  discount?: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function DiscountModal({ discount, onClose, onSave }: DiscountModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'fixed',
    value: '',
    minPurchaseAmount: '',
    isActive: true,
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code || '',
        description: discount.description || '',
        type: discount.type || 'fixed',
        value: discount.value || '',
        minPurchaseAmount: discount.minPurchaseAmount && discount.minPurchaseAmount !== '0' ? discount.minPurchaseAmount : '',
        isActive: discount.isActive,
        startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
        endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
      });
    }
  }, [discount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      setError('Kode dan Nilai Diskon wajib diisi');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSave({
        ...formData,
        minPurchaseAmount: formData.minPurchaseAmount || '0'
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan promo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{discount ? 'Edit Promo' : 'Buat Promo Baru'}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Atur kode diskon untuk pelanggan</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Kode Promo *</label>
              <input
                type="text"
                required
                placeholder="Contoh: MERDEKA20"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold uppercase transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi / Nama Promo</label>
              <input
                type="text"
                placeholder="Contoh: Promo Spesial Hari Kemerdekaan"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tipe Diskon *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value, value: '' })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold transition-all"
                >
                  <option value="fixed">Nominal (Rp)</option>
                  <option value="percentage">Persentase (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nilai *</label>
                <div className="relative">
                  {formData.type === 'fixed' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>}
                  <input
                    type="number"
                    required
                    min="0"
                    max={formData.type === 'percentage' ? 100 : undefined}
                    placeholder="0"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    className={`w-full py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold transition-all ${formData.type === 'fixed' ? 'pl-11 pr-4' : 'pl-4 pr-10'}`}
                  />
                  {formData.type === 'percentage' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Minimal Belanja (Opsional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.minPurchaseAmount}
                  onChange={e => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mulai Berlaku</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Berakhir Pada</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="w-12 h-6 rounded-full transition-colors relative flex items-center bg-slate-200 peer-checked:bg-teal-500">
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute transition-all ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-700">Promo Aktif</span>
                  <span className="block text-xs text-slate-500">Kasir dapat menggunakan kode ini</span>
                </div>
              </label>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
