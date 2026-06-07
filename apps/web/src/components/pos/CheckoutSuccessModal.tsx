import React, { useState, useEffect } from 'react';
import { CheckCircle2, MessageCircle, Printer, Plus } from 'lucide-react';

interface CheckoutSuccessModalProps {
  transaction: any;
  changeAmount: number;
  customer?: any;
  onPrint: () => void;
  onClose: () => void;
}

export function CheckoutSuccessModal({ transaction, changeAmount, customer, onPrint, onClose }: CheckoutSuccessModalProps) {
  const [waNumber, setWaNumber] = useState('');

  useEffect(() => {
    if (customer?.phone) {
      // Auto-fill WhatsApp number if customer has phone
      let phone = customer.phone;
      // Convert 08... to 628...
      if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
      }
      setWaNumber(phone);
    }
  }, [customer]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSendWA = () => {
    if (!waNumber) {
      alert("Masukkan nomor WhatsApp terlebih dahulu");
      return;
    }

    // Prepare Receipt Text
    const storeName = "Transaksi Kita"; // Should come from settings in real app
    const date = new Date(transaction.createdAt).toLocaleString('id-ID');
    
    let text = `*${storeName}*\n`;
    text += `Struk Pembelian\n`;
    text += `No: ${transaction.transactionNumber}\n`;
    text += `Tanggal: ${date}\n`;
    text += `--------------------------------\n`;
    
    (transaction.items || []).forEach((item: any) => {
      text += `${item.productName}\n`;
      text += `${item.quantity} x ${formatCurrency(item.unitPrice)}\n`;
      text += `Subtotal: ${formatCurrency(item.subtotal)}\n`;
    });
    
    text += `--------------------------------\n`;
    text += `*Total: ${formatCurrency(transaction.totalAmount)}*\n`;
    if (transaction.paymentMethod === 'cash') {
      text += `Tunai: ${formatCurrency(transaction.totalAmount + changeAmount)}\n`;
      text += `Kembali: ${formatCurrency(changeAmount)}\n`;
    } else {
      text += `Metode: ${transaction.paymentMethod.toUpperCase()}\n`;
    }
    text += `--------------------------------\n`;
    text += `Terima kasih telah berbelanja! 🙏`;

    const encodedText = encodeURIComponent(text);
    
    // Format WA number (remove spaces, symbols)
    let finalNumber = waNumber.replace(/\D/g, '');
    if (finalNumber.startsWith('0')) {
      finalNumber = '62' + finalNumber.substring(1);
    }

    window.open(`https://wa.me/${finalNumber}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform animate-in fade-in zoom-in duration-300">
        <div className="pt-8 pb-6 px-8 text-center bg-gradient-to-b from-teal-50 to-white">
          <div className="mx-auto w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 size={40} className="animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Pembayaran Berhasil!</h2>
          <p className="text-gray-500 font-medium">Transaksi #{transaction.transactionNumber}</p>
        </div>

        <div className="px-8 py-6 bg-white border-y border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500">Total Transaksi</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(transaction.totalAmount)}</span>
          </div>
          {transaction.paymentMethod === 'cash' && (
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
              <span className="text-gray-500 font-medium">Kembalian</span>
              <span className="text-xl font-bold text-emerald-600">{formatCurrency(changeAmount)}</span>
            </div>
          )}
        </div>

        <div className="p-8 space-y-4 bg-gray-50/50">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kirim Struk via WhatsApp</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+62</span>
                <input 
                  type="text" 
                  value={waNumber.startsWith('62') ? waNumber.substring(2) : (waNumber.startsWith('0') ? waNumber.substring(1) : waNumber)}
                  onChange={(e) => setWaNumber('62' + e.target.value.replace(/\D/g, ''))}
                  placeholder="8123456789"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSendWA}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex items-center transition-all shadow-sm hover:shadow-md"
                title="Kirim WhatsApp"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button 
              onClick={() => {
                onPrint();
              }}
              className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Printer size={18} />
              Cetak Struk
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-teal-600 text-white hover:bg-teal-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              Transaksi Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
