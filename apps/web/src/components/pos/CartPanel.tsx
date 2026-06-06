'use client';
import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, Plus, Minus, CreditCard, Wallet, Banknote, PauseCircle, ListTodo, User, X, MessageSquare } from 'lucide-react';
import { HeldTransactionsModal } from './HeldTransactionsModal';
import { checkoutTransaction, holdTransaction as apiHoldTransaction, getCustomers } from '@/lib/api';
import { PrintReceiptPortal } from './ReceiptTemplate';
import { Toast, ToastType } from '../ui/Toast';

export function CartPanel() {
  const { items, removeItem, updateQuantity, updateDiscount, clearCart, getSubtotal, getTotalDiscount, holdTransaction, heldTransactions, globalDiscount, setGlobalDiscount, isTaxEnabled, setTaxEnabled } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [printTx, setPrintTx] = useState<any>(null);

  // Customer & Points
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  useEffect(() => {
    getCustomers().then(data => setCustomers(data)).catch(console.error);
  }, []);

  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const subtotalAfterDiscount = subtotal - totalDiscount;
  const tax = isTaxEnabled ? subtotalAfterDiscount * 0.11 : 0;
  let total = subtotalAfterDiscount + tax;

  // 1 point = Rp 10 discount
  const pointsDiscount = pointsToRedeem * 10;
  total = Math.max(0, total - pointsDiscount);

  const handleCheckout = async () => {
    setIsCheckout(true);
    try {
      const res = await checkoutTransaction({
        tenantId: '00000000-0000-0000-0000-000000000000',
        cashierId: '11111111-1111-1111-1111-111111111111',
        customerId: selectedCustomer?.id,
        customerPhone: sendWhatsapp ? customerWhatsapp : undefined,
        pointsRedeemed: pointsToRedeem,
        paymentMethod,
        subtotal: subtotal,
        taxAmount: tax,
        discountAmount: totalDiscount + pointsDiscount,
        totalAmount: total,
        items: items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: typeof i.sellingPrice === 'string' ? parseFloat(i.sellingPrice) : i.sellingPrice,
          subtotal: (typeof i.sellingPrice === 'string' ? parseFloat(i.sellingPrice) : i.sellingPrice) * i.quantity - i.discount * i.quantity
        }))
      });
      
      const txForPrinting = {
        transactionNumber: res.data?.transactionNumber || `TRX-${Date.now()}`,
        createdAt: new Date(),
        subtotal,
        taxAmount: tax,
        discountAmount: totalDiscount + pointsDiscount,
        totalAmount: total,
        paymentMethod,
        items: items.map(i => ({
          productName: i.name,
          quantity: i.quantity,
          unitPrice: i.sellingPrice,
          discount: i.discount || 0
        }))
      };

      if (confirm('Checkout successful! Do you want to print the receipt?')) {
        setPrintTx(txForPrinting);
        showToast('Transaksi Berhasil!', 'success');
        setTimeout(() => {
          window.print();
          setTimeout(() => {
            setPrintTx(null);
            setIsSuccess(false);
            clearCart();
            setSelectedCustomer(null);
            setPointsToRedeem(0);
            setCustomerWhatsapp('');
            setCashTendered(0);
          }, 500);
        }, 100);
      } else {
        setIsSuccess(true);
        showToast('Transaksi Berhasil!', 'success');
        setTimeout(() => {
          setIsSuccess(false);
          clearCart();
          setSelectedCustomer(null);
          setPointsToRedeem(0);
          setCustomerWhatsapp('');
          setCashTendered(0);
        }, 2000);
      }
    } catch (err) {
      showToast('Gagal memproses transaksi. Pastikan API menyala.', 'error');
    } finally {
      setIsCheckout(false);
    }
  };

  const handleHold = async () => {
    const note = prompt('Enter a note for this held transaction (e.g. Table 5):');
    if (note !== null) {
      try {
        await apiHoldTransaction({
          tenantId: '00000000-0000-0000-0000-000000000000',
          cashierId: '11111111-1111-1111-1111-111111111111',
          notes: note || `Customer ${heldTransactions.length + 1}`,
          subtotal: subtotal,
          taxAmount: tax,
          discountAmount: totalDiscount,
          totalAmount: total,
          items: items.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            unitPrice: typeof i.sellingPrice === 'string' ? parseFloat(i.sellingPrice) : i.sellingPrice,
            discount: i.discount || 0,
            tax: isTaxEnabled ? ((typeof i.sellingPrice === 'string' ? parseFloat(i.sellingPrice) : i.sellingPrice) - (i.discount || 0)) * 0.11 : 0,
            subtotal: (typeof i.sellingPrice === 'string' ? parseFloat(i.sellingPrice) : i.sellingPrice) * i.quantity - i.discount * i.quantity
          }))
        });
        clearCart();
        setGlobalDiscount(0);
        setSelectedCustomer(null);
        setPointsToRedeem(0);
        showToast('Transaksi berhasil ditahan', 'info');
      } catch (err) {
        console.error(err);
        showToast('Gagal menahan transaksi. Pastikan API menyala.', 'error');
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-3xl">
          ✓
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Payment Successful!</h2>
          <p className="text-gray-500 mt-2 text-sm">Receipt is printing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Current Order</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHeldModal(true)}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-black transition-colors relative"
          >
            <ListTodo size={16} />
            <span>Held</span>
          </button>
          <button 
            onClick={clearCart}
            disabled={items.length === 0}
            className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors ml-4"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Customer Input (Sleek) */}
      <div className="px-5 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 focus-within:border-[#0B5A63] focus-within:ring-1 focus-within:ring-[#0B5A63] transition-all">
          <User size={18} className="text-gray-400" />
          <input 
            type="text"
            list="customer-list"
            placeholder="Nama Pelanggan (Opsional)..."
            className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700"
            onChange={(e) => {
              const c = customers.find(x => x.name === e.target.value);
              setSelectedCustomer(c || null);
              if (!c) setPointsToRedeem(0);
            }}
          />
          <datalist id="customer-list">
            {customers.map(c => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        {/* WhatsApp Checkbox & Input */}
        <div className="mt-3 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input 
              type="checkbox" 
              className="rounded text-[#0B5A63] focus:ring-[#0B5A63] h-4 w-4 border-gray-300"
              checked={sendWhatsapp}
              onChange={(e) => setSendWhatsapp(e.target.checked)}
            />
            <MessageSquare size={16} className={sendWhatsapp ? "text-[#0B5A63]" : "text-gray-400"} />
            <span className="font-medium">Kirim struk via WhatsApp</span>
          </label>
        </div>
        
        {sendWhatsapp && (
          <div className="mt-2 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 focus-within:border-[#0B5A63] focus-within:ring-1 focus-within:ring-[#0B5A63] transition-all">
             <span className="text-gray-500 text-sm font-medium">+62</span>
             <input 
               type="text"
               placeholder="81234567890"
               value={customerWhatsapp}
               onChange={(e) => setCustomerWhatsapp(e.target.value.replace(/\D/g, ''))}
               className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700"
             />
          </div>
        )}

        
        {/* If customer selected and has points */}
        {selectedCustomer && parseInt(selectedCustomer.points || '0') > 0 && (
          <div className="mt-3 text-sm flex items-center justify-between bg-teal-50 px-3 py-2 rounded-xl border border-teal-100">
            <div>
              <span className="text-teal-800 font-medium block">Poin Tersedia: {parseInt(selectedCustomer.points || '0')}</span>
              <span className="text-teal-600 text-xs">-Rp {(pointsToRedeem * 10).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-800 font-medium text-xs">Pakai:</span>
              <input 
                type="number"
                min="0"
                max={parseInt(selectedCustomer.points || '0')}
                value={pointsToRedeem === 0 ? '' : pointsToRedeem}
                placeholder="0"
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setPointsToRedeem(Math.min(val, parseInt(selectedCustomer.points || '0')));
                }}
                className="w-16 p-1 text-center border border-teal-200 rounded-lg bg-white text-teal-900 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <span className="text-4xl">🛒</span>
            <p className="text-sm font-medium">Cart is empty</p>
          </div>
        ) : (
          items.map(item => {
            const price = typeof item.sellingPrice === 'string' ? parseFloat(item.sellingPrice) : item.sellingPrice;
            return (
            <div key={item.id} className="flex flex-col gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 relative group">
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-1">Rp {price.toLocaleString('id-ID')}</p>
                </div>
                
                <div className="flex flex-col items-end justify-between">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors absolute top-4 right-4"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-2 py-1 mt-6">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-500">Disc/Item (Rp)</span>
                <input 
                  type="number" 
                  value={item.discount || ''}
                  onChange={(e) => updateDiscount(item.id, parseFloat(e.target.value) || 0)}
                  className="bg-white border border-gray-200 rounded-lg text-sm px-2 py-1 w-24 focus:outline-none focus:border-black"
                  placeholder="0"
                />
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Summary & Checkout */}
      <div className="p-5 border-t border-gray-100 bg-gray-50/30">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
            <span>Subtotal</span>
            <span className="text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-gray-500">Global Discount (Rp)</span>
            <input 
              type="number" 
              value={globalDiscount || ''}
              onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
              className="bg-white border border-gray-200 rounded-lg text-sm px-2 py-1 w-28 text-right focus:outline-none focus:border-black text-gray-900"
              placeholder="0"
            />
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-500 font-medium">
              <span>Total Item/Global Disc</span>
              <span>- Rp {totalDiscount.toLocaleString('id-ID')}</span>
            </div>
          )}

          {pointsDiscount > 0 && (
            <div className="flex justify-between text-sm text-yellow-600 font-medium">
              <span>Loyalty Points Discount</span>
              <span>- Rp {pointsDiscount.toLocaleString('id-ID')}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isTaxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black border-gray-300"
              />
              <span>Tax (PPN 11%)</span>
            </label>
            <span className="text-gray-900">Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-black mt-2 pt-2 border-t border-gray-200/60">
            <span>Total</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
          
          {selectedCustomer && (
            <div className="text-right text-xs text-blue-600 font-medium mt-1">
              *Akan mendapat {Math.floor(total / 1000)} Poin
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="mb-4 flex gap-2">
          {[
            { id: 'Cash', icon: <Banknote size={16} /> },
            { id: 'QRIS', icon: <Wallet size={16} /> },
            { id: 'Card', icon: <CreditCard size={16} /> }
          ].map(method => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all ${
                paymentMethod === method.id 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {method.icon}
              <span className="text-xs font-semibold">{method.id}</span>
            </button>
          ))}
        </div>

        {paymentMethod === 'Cash' && (
          <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
             <div className="flex justify-between items-center text-sm font-medium mb-2">
               <span className="text-gray-700">Nominal Uang</span>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-normal">Rp</span>
                 <input 
                   type="text"
                   value={cashTendered === 0 ? '' : cashTendered.toLocaleString('id-ID')}
                   onChange={(e) => setCashTendered(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                   className="bg-white border border-gray-300 rounded-lg text-sm pl-8 pr-3 py-2 w-36 text-right focus:outline-none focus:border-black font-bold text-gray-900"
                   placeholder="0"
                 />
               </div>
             </div>
             
             {/* Quick cash buttons */}
             <div className="flex gap-2 mb-3">
               <button onClick={() => setCashTendered(total)} className="flex-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-black hover:text-black transition-colors">Uang Pas</button>
               <button onClick={() => setCashTendered(50000)} className="flex-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-black hover:text-black transition-colors">50k</button>
               <button onClick={() => setCashTendered(100000)} className="flex-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-black hover:text-black transition-colors">100k</button>
             </div>

             {cashTendered > 0 && (
               <div className={`flex justify-between items-center text-sm pt-2 border-t border-gray-200 border-dashed ${cashTendered >= total ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}`}>
                 <span>{cashTendered >= total ? 'Kembalian' : 'Kurang'}</span>
                 <span className="text-lg">Rp {Math.abs(cashTendered - total).toLocaleString('id-ID')}</span>
               </div>
             )}
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={handleHold}
            disabled={items.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Hold Transaction"
          >
            <PauseCircle size={20} />
          </button>
          <button 
            onClick={handleCheckout}
            disabled={items.length === 0 || isCheckout || (paymentMethod === 'Cash' && cashTendered > 0 && cashTendered < total)}
            className="flex-1 py-4 bg-black text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCheckout ? 'Processing...' : `Charge Rp ${total.toLocaleString('id-ID')}`}
          </button>
        </div>
      </div>

      {showHeldModal && <HeldTransactionsModal onClose={() => setShowHeldModal(false)} />}
      {printTx && <PrintReceiptPortal transaction={printTx} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
