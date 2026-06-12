'use client';
import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, Plus, Minus, CreditCard, Wallet, Banknote, PauseCircle, ListTodo, User, X, MessageSquare } from 'lucide-react';
import { HeldTransactionsModal } from './HeldTransactionsModal';
import { checkoutTransaction, holdTransaction as apiHoldTransaction, getCustomers, validateDiscount } from '@/lib/api';
import { PrintReceiptPortal } from './ReceiptTemplate';
import { CheckoutSuccessModal } from './CheckoutSuccessModal';
import { NonCashPaymentModal } from './NonCashPaymentModal';
import { Toast, ToastType } from '../ui/Toast';
import { playBeep } from '@/lib/audio';

import { useHotkeys } from '@/hooks/useHotkeys';

export function CartPanel() {
  const { items, removeItem, updateQuantity, updateDiscount, clearCart, getSubtotal, getTotalDiscount, holdTransaction, heldTransactions, globalDiscount, setGlobalDiscount, isTaxEnabled, setTaxEnabled } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [showNonCashModal, setShowNonCashModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{ transaction: any, changeAmount: number, customer: any } | null>(null);

  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

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

  // Set up Hotkeys
  useHotkeys({
    'F8': (e) => {
      e.preventDefault();
      if (items.length > 0 && !isCheckout && !successModalData) {
        initiateCheckout();
      }
    },
    'Escape': (e) => {
      e.preventDefault();
      if (items.length > 0 && !successModalData && !showNonCashModal && !showHeldModal) {
        clearCart();
      }
    }
  });

  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const subtotalAfterDiscount = subtotal - totalDiscount;
  const tax = isTaxEnabled ? subtotalAfterDiscount * 0.11 : 0;
  let total = subtotalAfterDiscount + tax;

  // 1 point = Rp 10 discount
  const pointsDiscount = pointsToRedeem * 10;
  total = Math.max(0, total - pointsDiscount);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setValidatingPromo(true);
    try {
      const data = await validateDiscount(promoCode, subtotalAfterDiscount);
      setAppliedPromo(data);
      setGlobalDiscount(data.calculatedAmount);
      showToast(`Promo ${data.code} berhasil diterapkan!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Promo tidak valid', 'error');
      setAppliedPromo(null);
      setGlobalDiscount(0);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setGlobalDiscount(0);
  };

  const initiateCheckout = () => {
    if (paymentMethod !== 'Cash') {
      setShowNonCashModal(true);
    } else {
      processCheckout();
    }
  };

  const processCheckout = async () => {
    setIsCheckout(true);
    setShowNonCashModal(false);
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
          variantId: i.selectedVariant?.id,
          variantName: i.selectedVariant?.name,
          modifiers: i.selectedModifiers ? i.selectedModifiers.map(m => ({ id: m.id, name: m.name, price: m.price })) : [],
          quantity: i.quantity,
          unitPrice: i.finalUnitPrice,
          subtotal: i.finalUnitPrice * i.quantity - i.discount * i.quantity
        }))
      });
      
      const change = paymentMethod === 'Cash' ? Math.max(0, cashTendered - total) : 0;
      
      setSuccessModalData({
        transaction: {
          ...res.data,
          transactionNumber: res.data?.transactionNumber || `TRX-${Date.now()}`,
          items: items.map(i => ({
            productName: i.name,
            quantity: i.quantity,
            unitPrice: i.finalUnitPrice,
            subtotal: (i.finalUnitPrice * i.quantity) - (i.discount || 0)
          }))
        },
        changeAmount: change,
        customer: selectedCustomer
      });
      
      playBeep('success');
      showToast('Transaksi Berhasil!', 'success');
    } catch (err) {
      playBeep('error');
      showToast('Gagal memproses transaksi. Pastikan API menyala.', 'error');
    } finally {
      setIsCheckout(false);
    }
  };

  const handleHold = async () => {
    const note = prompt('Enter Table Number, License Plate, or Note for this Open Bill:');
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
            variantId: i.selectedVariant?.id,
            variantName: i.selectedVariant?.name,
            modifiers: i.selectedModifiers ? i.selectedModifiers.map(m => ({ id: m.id, name: m.name, price: m.price })) : [],
            quantity: i.quantity,
            unitPrice: i.finalUnitPrice,
            discount: i.discount || 0,
            tax: isTaxEnabled ? (i.finalUnitPrice - (i.discount || 0)) * 0.11 : 0,
            subtotal: i.finalUnitPrice * i.quantity - i.discount * i.quantity
          }))
        });
        clearCart();
        setGlobalDiscount(0);
        setSelectedCustomer(null);
        setPointsToRedeem(0);
        setPromoCode('');
        setAppliedPromo(null);
        showToast('Transaksi berhasil ditahan', 'info');
      } catch (err) {
        console.error(err);
        showToast('Gagal menahan transaksi. Pastikan API menyala.', 'error');
      }
    }
  };

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100/60 bg-white/50 backdrop-blur-md z-10">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-800">Pesanan</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHeldModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-transform active:scale-95"
          >
            <ListTodo size={16} />
            <span>Simpan</span>
          </button>
          <button 
            onClick={clearCart}
            disabled={items.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold disabled:opacity-50 transition-transform active:scale-95"
          >
            <Trash2 size={16} />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Customer Input (Sleek) */}
      <div className="px-5 py-3 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-sm focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-50 transition-all">
          <User size={20} className="text-slate-400" />
          <input 
            type="text"
            list="customer-list"
            placeholder="Pilih Pelanggan (Opsional)..."
            className="w-full bg-transparent border-none focus:outline-none text-base font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
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

        {/* WhatsApp Checkbox (Interactive iOS-style Switch) */}
        <div className="mt-3 px-1 flex items-center justify-between cursor-pointer group" onClick={() => setSendWhatsapp(!sendWhatsapp)}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-xl transition-colors ${sendWhatsapp ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
              <MessageSquare size={16} className="fill-current opacity-20 absolute" />
              <MessageSquare size={16} className="relative z-10" />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-sm">Struk WhatsApp</p>
              <p className="text-xs text-slate-400 font-medium">Kirim nota digital ke pembeli</p>
            </div>
          </div>
          {/* Switch */}
          <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${sendWhatsapp ? 'bg-teal-500' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute transition-all ${sendWhatsapp ? 'left-7' : 'left-1'}`}></div>
          </div>
        </div>
        
        {sendWhatsapp && (
          <div className="mt-2 flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-50 transition-all animate-in slide-in-from-top-2 fade-in">
             <span className="text-slate-400 text-sm font-bold">+62</span>
             <input 
               type="text"
               placeholder="81234567890"
               value={customerWhatsapp}
               onChange={(e) => setCustomerWhatsapp(e.target.value.replace(/\D/g, ''))}
               className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800"
             />
          </div>
        )}

        
        {/* If customer selected and has points */}
        {selectedCustomer && parseInt(selectedCustomer.points || '0') > 0 && (
          <div className="mt-3 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 rounded-xl border border-amber-200/50 shadow-sm animate-in zoom-in-95 fade-in">
            <div>
              <span className="text-amber-900 font-extrabold text-sm block">Poin Belanja: {parseInt(selectedCustomer.points || '0')}</span>
              <span className="text-amber-600 font-bold text-xs">-Rp {(pointsToRedeem * 10).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-800 font-bold text-xs uppercase tracking-wider">Tukar:</span>
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
                className="w-16 p-2 text-center border-2 border-amber-200 rounded-xl bg-white font-bold text-amber-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col hide-scrollbar relative">
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/50 to-transparent z-10 pointer-events-none"></div>
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 opacity-80">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-1 border-4 border-white shadow-sm">
              <span className="text-3xl opacity-40 grayscale">🛒</span>
            </div>
            <div className="text-center">
              <p className="text-base font-extrabold text-slate-600 mb-0.5">Keranjang Kosong</p>
              <p className="text-xs font-medium text-slate-400">Pilih menu untuk memulai transaksi</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-2">
            {items.map(item => {
              const price = item.finalUnitPrice;
              return (
              <div key={item.cartItemId} className="flex flex-col p-3 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 transition-all hover:shadow-[0_8px_30px_-15px_rgba(0,0,0,0.1)] relative animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center justify-center w-8 h-8 bg-teal-50/50 rounded-lg border border-teal-100/50">
                    <span className="font-extrabold text-teal-800 text-sm">{item.quantity}</span>
                  </div>
                  <div className="flex-1 pt-0">
                    <p className="font-bold text-slate-900 text-sm leading-tight">{item.name}</p>
                    
                    {item.selectedVariant && (
                      <p className="text-xs text-teal-700 mt-1.5 font-bold bg-teal-50 px-2 py-0.5 rounded-md w-fit border border-teal-100">{item.selectedVariant.name}</p>
                    )}
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-50 px-2 py-0.5 rounded-md w-fit">
                        + {item.selectedModifiers.map(m => m.name).join(', ')}
                      </p>
                    )}

                    {item.discount > 0 && (
                       <p className="text-xs text-rose-600 mt-1 font-bold bg-rose-50 px-2 py-0.5 rounded-md w-fit">Diskon: -Rp {item.discount.toLocaleString('id-ID')}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-extrabold text-slate-900 text-sm pt-0">
                      Rp {(price * item.quantity).toLocaleString('id-ID')}
                    </span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-90 transition-all shadow-sm"
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-100 hover:bg-teal-200 text-teal-700 active:scale-90 transition-all shadow-sm"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => removeItem(item.cartItemId)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 ml-1.5 active:scale-90 transition-all shadow-sm"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/80 to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* Summary & Checkout */}
      <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] rounded-t-2xl relative z-20">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-center text-sm font-bold text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
            <span>Subtotal ({items.length} item)</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
              <div className={`p-1 bg-slate-100 rounded-full transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}>
                <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {showAdvancedOptions && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2 animate-in slide-in-from-top-2 fade-in">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Kode Promo</span>
                {appliedPromo ? (
                  <div className="flex items-center gap-2">
                    <span className="text-teal-600 bg-teal-50 px-2 py-1 rounded-md border border-teal-100">{appliedPromo.code}</span>
                    <button onClick={handleRemovePromo} className="text-rose-500 hover:text-rose-600">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="bg-white border-2 border-slate-200 rounded-lg px-2 py-1 w-28 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-slate-900 font-bold transition-all uppercase"
                      placeholder="KODE"
                    />
                    <button 
                      onClick={handleApplyPromo}
                      disabled={validatingPromo || !promoCode}
                      className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs hover:bg-slate-700 disabled:opacity-50"
                    >
                      Pakai
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={isTaxEnabled}
                      onChange={(e) => setTaxEnabled(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-all flex items-center justify-center">
                      <svg className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <span className="group-hover:text-slate-800 transition-colors">Terapkan PPN (11%)</span>
                </label>
                <span className="text-slate-800">Rp {tax.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          {(totalDiscount > 0 || pointsDiscount > 0) && (
            <div className="flex flex-col gap-1 border-t border-dashed border-slate-200 pt-2 mt-1">
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm font-bold text-rose-500">
                  <span>Total Diskon</span>
                  <span>- Rp {totalDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-sm font-bold text-amber-500">
                  <span>Tukar Poin</span>
                  <span>- Rp {pointsDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-end mt-1 pt-2 border-t-2 border-slate-100">
            <span className="text-xs font-bold text-slate-500 mb-1">TOTAL BAYAR</span>
            <span className="text-3xl font-black text-teal-600 tracking-tight">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          
          {selectedCustomer && (
            <div className="text-right text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-lg w-fit ml-auto border border-amber-100">
              +{Math.floor(total / 1000)} Poin didapat
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="mb-3 flex gap-2 p-1 bg-slate-100/80 rounded-xl">
          {[
            { id: 'Cash', label: 'Tunai', icon: <Banknote size={16} /> },
            { id: 'QRIS', label: 'QRIS', icon: <Wallet size={16} /> },
            { id: 'Card', label: 'Kartu', icon: <CreditCard size={16} /> }
          ].map(method => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-300 ${
                paymentMethod === method.id 
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold scale-[1.02] border border-slate-100' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 font-bold'
              }`}
            >
              <div className={paymentMethod === method.id ? 'text-teal-600' : ''}>{method.icon}</div>
              <span className="text-xs">{method.label}</span>
            </button>
          ))}
        </div>

        {paymentMethod === 'Cash' && (
          <div className="mb-4 bg-slate-50 p-3 rounded-xl border-2 border-slate-200/60 animate-in slide-in-from-bottom-2 fade-in">
             <div className="flex justify-between items-center text-sm font-bold mb-2">
               <span className="text-slate-600 text-sm">Uang Diterima</span>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg">Rp</span>
                 <input 
                   type="text"
                   value={cashTendered === 0 ? '' : cashTendered.toLocaleString('id-ID')}
                   onChange={(e) => setCashTendered(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                   className="bg-white border-2 border-slate-200 rounded-lg text-base pl-10 pr-3 py-2 w-40 text-right focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 font-black text-slate-900 transition-all shadow-sm"
                   placeholder="0"
                 />
               </div>
             </div>
             
             {/* UMKM Friendly Quick cash buttons - Chunky and clickable */}
             <div className="flex gap-2 mb-3">
               <button onClick={() => setCashTendered(total)} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-teal-600 shadow-sm active:scale-95 transition-all">Uang Pas</button>
               <button onClick={() => setCashTendered(50000)} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 shadow-sm active:scale-95 transition-all">50 Ribu</button>
               <button onClick={() => setCashTendered(100000)} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 shadow-sm active:scale-95 transition-all">100 Ribu</button>
             </div>

             {cashTendered > 0 && (
               <div className={`flex justify-between items-center pt-4 border-t-2 border-slate-200 border-dashed ${cashTendered >= total ? 'text-emerald-600' : 'text-rose-500'}`}>
                 <span className="font-bold text-base">{cashTendered >= total ? 'KEMBALIAN' : 'KURANG BAYAR'}</span>
                 <span className="text-2xl font-black">Rp {Math.abs(cashTendered - total).toLocaleString('id-ID')}</span>
               </div>
             )}
          </div>
        )}

        <button 
          onClick={initiateCheckout}
          disabled={items.length === 0 || isCheckout || (paymentMethod === 'Cash' && cashTendered > 0 && cashTendered < total)}
          className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-black text-xl hover:from-teal-600 hover:to-emerald-600 active:scale-[0.98] shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.5)] transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none disabled:from-slate-300 disabled:to-slate-400 flex items-center justify-center gap-2 tracking-wide"
        >
          {isCheckout ? 'Memproses...' : `BAYAR SEKARANG`}
        </button>
      </div>

      {showHeldModal && <HeldTransactionsModal onClose={() => setShowHeldModal(false)} />}
      
      {showNonCashModal && (
        <NonCashPaymentModal 
          method={paymentMethod as 'QRIS' | 'Card'}
          total={total}
          onConfirm={processCheckout}
          onCancel={() => setShowNonCashModal(false)}
        />
      )}
      
      {/* Modals & Portals */}
      
      {successModalData && (
        <CheckoutSuccessModal
          transaction={successModalData.transaction}
          changeAmount={successModalData.changeAmount}
          customer={successModalData.customer}
          onClose={() => {
            setSuccessModalData(null);
            clearCart();
            setCashTendered(0);
            setSelectedCustomer(null);
            setPointsToRedeem(0);
            setPromoCode('');
            setAppliedPromo(null);
            setGlobalDiscount(0);
          }}
        />
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
