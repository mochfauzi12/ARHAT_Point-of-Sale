import React, { useState } from 'react';
import { QrCode, CreditCard, CheckCircle2, Wallet, X } from 'lucide-react';

interface NonCashPaymentModalProps {
  method: 'QRIS' | 'Card';
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NonCashPaymentModal({ method, total, onConfirm, onCancel }: NonCashPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate a brief delay to mimic cashier checking EDC/Mutasi
    setTimeout(() => {
      onConfirm();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-teal-50 border-4 border-teal-100 shadow-inner">
            {method === 'QRIS' ? (
              <QrCode size={40} className="text-teal-600" />
            ) : (
              <CreditCard size={40} className="text-teal-600" />
            )}
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-1">
            Pembayaran {method}
          </h2>
          <p className="text-slate-500 font-medium mb-6">
            Tagihan: <span className="font-bold text-teal-600 text-xl block mt-1">Rp {total.toLocaleString('id-ID')}</span>
          </p>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8">
            <p className="text-sm font-bold text-slate-600">
              {method === 'QRIS' 
                ? 'Silakan minta pelanggan untuk melakukan scan QRIS di meja kasir. Pastikan saldo sudah masuk.' 
                : 'Silakan masukkan/gesek kartu pelanggan pada mesin EDC dan selesaikan transaksi.'}
            </p>
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-[2] py-4 bg-teal-600 text-white rounded-2xl font-black text-lg hover:bg-teal-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-80"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Sudah Dibayar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
