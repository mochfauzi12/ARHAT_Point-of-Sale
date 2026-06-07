'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, Edit, MessageCircle, Star, Crown, History, X, ShoppingBag } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, getCustomerTransactions, sendCustomerNotification } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: string;
  totalSpent: string;
  notes: string;
}

interface Transaction {
  id: string;
  transactionNumber: string;
  totalAmount: string;
  pointsEarned: string;
  pointsRedeemed: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  
  // History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerTx, setCustomerTx] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Notify Modal
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const openNotify = (c: Customer) => {
    setSelectedCustomer(c);
    setNotifyMessage('');
    setShowNotifyModal(true);
  };

  const handleSendNotify = async () => {
    if (!selectedCustomer?.phone || !notifyMessage) return;
    setIsSending(true);
    try {
      await sendCustomerNotification(selectedCustomer.phone, notifyMessage);
      alert('Pesan berhasil masuk antrean pengiriman!');
      setShowNotifyModal(false);
    } catch (e) {
      console.error(e);
      alert('Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const getTier = (spent: string | number) => {
    const s = Number(spent);
    if (s > 10000000) return { name: 'Platinum', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    if (s >= 1000000) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { name: 'Silver', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers(searchQuery);
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadCustomers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleEdit = (c: Customer) => {
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      notes: c.notes || ''
    });
    setEditingId(c.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await createCustomer(formData);
      }
      setShowModal(false);
      setFormData({ name: '', phone: '', email: '', notes: '' });
      setEditingId(null);
      loadCustomers();
    } catch (error) {
      alert('Gagal menyimpan data pelanggan');
    }
  };

  const openHistory = async (c: Customer) => {
    setSelectedCustomer(c);
    setShowHistoryModal(true);
    setLoadingTx(true);
    try {
      const tx = await getCustomerTransactions(c.id);
      setCustomerTx(tx);
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingTx(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(amount));
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
            <Users className="mr-3 text-slate-800" size={32} />
            Pelanggan
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Kelola data pelanggan dan poin loyalitas.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', phone: '', email: '', notes: '' });
            setShowModal(true);
          }}
          className="bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={20} className="mr-2" />
          Tambah Pelanggan
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Cari nama atau nomor telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border-slate-200 rounded-2xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none font-medium text-slate-700 shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                <th className="p-6 font-bold">Pelanggan</th>
                <th className="p-6 font-bold">Kontak</th>
                <th className="p-6 font-bold">Total Belanja</th>
                <th className="p-6 font-bold">Poin</th>
                <th className="p-6 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 font-bold animate-pulse">Memuat data pelanggan...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
                      <Users size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Belum ada pelanggan</h3>
                    <p className="text-slate-500 mt-1">Mulai tambahkan pelanggan untuk mencatat loyalitas.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center mr-4 font-bold text-lg border border-slate-200/50 shadow-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                            {c.name}
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${getTier(c.totalSpent).color}`}>
                              {getTier(c.totalSpent).name}
                            </span>
                          </div>
                          {c.notes && <div className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1 max-w-[200px]">{c.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-600">
                        {c.phone && (
                          <div className="flex items-center">
                            <Phone size={14} className="mr-2 text-slate-400" />
                            {c.phone}
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center">
                            <Mail size={14} className="mr-2 text-slate-400" />
                            {c.email}
                          </div>
                        )}
                        {!c.phone && !c.email && <span className="text-slate-400 italic">Tidak ada kontak</span>}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-slate-700">
                        {formatCurrency(c.totalSpent || 0)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 font-bold text-sm">
                        <Star size={16} className="mr-1.5 fill-amber-500 text-amber-500" />
                        {c.points || 0}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openHistory(c)}
                          className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                          title="Riwayat Belanja"
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(c)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                          title="Edit Pelanggan"
                        >
                          <Edit size={18} />
                        </button>
                        {c.phone && (
                          <>
                            <a 
                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors"
                              title="Chat WhatsApp Manual"
                            >
                              <MessageCircle size={18} />
                            </a>
                            <button
                              onClick={() => openNotify(c)}
                              className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl transition-colors"
                              title="Kirim Pesan Sistem"
                            >
                              <Mail size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <Users size={24} className="mr-3 text-slate-700" />
                {editingId ? 'Edit Pelanggan' : 'Pelanggan Baru'}
              </h3>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Pelanggan *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none font-medium" 
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">No. WhatsApp</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none font-medium" 
                      placeholder="0812..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none font-medium" 
                      placeholder="budi@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Catatan (Opsional)</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none font-medium resize-none" 
                    placeholder="Contoh: Suka kopi tanpa gula"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat Belanja */}
      {showHistoryModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center mr-4 shadow-sm">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Riwayat Belanja
                    <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-md border ${getTier(selectedCustomer.totalSpent).color}`}>
                      {getTier(selectedCustomer.totalSpent).name}
                    </span>
                  </h3>
                  <p className="text-sm font-medium text-slate-500">{selectedCustomer.name}</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingTx ? (
                <div className="text-center py-12 text-slate-500 font-bold animate-pulse">Memuat riwayat...</div>
              ) : customerTx.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Belum ada transaksi untuk pelanggan ini.</div>
              ) : (
                <div className="space-y-4">
                  {customerTx.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-bold text-slate-900">{tx.transactionNumber}</div>
                        <div className="text-sm text-slate-500 mt-1">{new Date(tx.createdAt).toLocaleString('id-ID')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-lg">{formatCurrency(tx.totalAmount)}</div>
                        {(Number(tx.pointsEarned) > 0 || Number(tx.pointsRedeemed) > 0) && (
                          <div className="text-xs font-medium flex items-center justify-end gap-2 mt-1">
                            {Number(tx.pointsEarned) > 0 && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+{tx.pointsEarned} Poin</span>}
                            {Number(tx.pointsRedeemed) > 0 && <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">-{tx.pointsRedeemed} Terpakai</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal Kirim Pesan */}
      {showNotifyModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNotifyModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <MessageCircle size={24} className="mr-3 text-teal-600" />
                Kirim Notifikasi WhatsApp
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Penerima</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
                  <span className="text-sm text-slate-500">{selectedCustomer.phone || 'Belum ada nomor'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Isi Pesan</label>
                <textarea 
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none font-medium resize-none" 
                  placeholder="Ketik pesan yang ingin dikirimkan..."
                />
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowNotifyModal(false)}
                  className="px-6 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSendNotify}
                  disabled={!selectedCustomer.phone || !notifyMessage || isSending}
                  className="px-8 py-3.5 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center"
                >
                  {isSending ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
