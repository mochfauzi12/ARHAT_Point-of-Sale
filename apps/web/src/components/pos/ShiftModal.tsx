import React, { useState } from 'react';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';

interface ShiftModalProps {
  type: 'open' | 'close';
  shiftData?: any;
  onSubmit: (amount: number, notes?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function ShiftModal({ type, shiftData, onSubmit, isSubmitting }: ShiftModalProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(parsedAmount)) return;
    await onSubmit(parsedAmount, notes);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setAmount('');
      return;
    }
    setAmount(parseInt(rawValue, 10).toLocaleString('id-ID'));
  };

  const expectedCash = shiftData?.expectedCash || 0;
  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
  const variance = type === 'close' ? parsedAmount - expectedCash : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`p-6 text-white flex flex-col items-center justify-center gap-3 ${type === 'open' ? 'bg-[#0B5A63]' : 'bg-orange-500'}`}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            {type === 'open' ? <Unlock size={32} /> : <Lock size={32} />}
          </div>
          <h2 className="text-2xl font-bold">
            {type === 'open' ? 'Buka Shift Kasir' : 'Tutup Shift Kasir'}
          </h2>
          <p className="text-white/80 text-center text-sm">
            {type === 'open' 
              ? 'Masukkan nominal uang modal yang ada di laci kasir saat ini sebelum memulai transaksi.' 
              : 'Hitung dan masukkan total uang fisik yang ada di laci kasir saat ini.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          
          {type === 'close' && shiftData && (
            <div className="bg-orange-50 p-4 rounded-2xl mb-2 border border-orange-100 flex flex-col gap-2">
              <div className="flex justify-between text-sm text-orange-800">
                <span>Modal Awal:</span>
                <span className="font-semibold">Rp {Number(shiftData.startingCash).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm text-orange-800">
                <span>Penjualan Tunai:</span>
                <span className="font-semibold">+ Rp {Number(shiftData.totalCashSales).toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-orange-200 my-1 pt-2 flex justify-between font-bold text-orange-900">
                <span>Uang di Sistem:</span>
                <span>Rp {expectedCash.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {type === 'open' ? 'Modal Awal (Rp)' : 'Uang Fisik Aktual (Rp)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
              <input
                required
                autoFocus
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B5A63] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {type === 'close' && amount !== '' && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${
              variance === 0 ? 'bg-green-50 text-green-800' : 
              variance < 0 ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
            }`}>
              {variance !== 0 && <AlertTriangle size={20} className="shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold">
                  {variance === 0 ? 'Balance / Sesuai' : 
                   variance < 0 ? 'Kurang (Minus)' : 'Lebih (Plus)'}
                </p>
                {variance !== 0 && (
                  <p className="text-sm mt-1">
                    Selisih: Rp {Math.abs(variance).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          )}

          {type === 'close' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Misal: Uang receh kurang..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B5A63]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !amount}
            className={`w-full py-4 mt-2 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'open' 
                ? 'bg-[#0B5A63] hover:bg-[#094a52] shadow-[#0B5A63]/20' 
                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
            }`}
          >
            {isSubmitting ? 'Memproses...' : (type === 'open' ? 'Buka Kasir' : 'Tutup Kasir')}
          </button>
        </form>

      </div>
    </div>
  );
}
