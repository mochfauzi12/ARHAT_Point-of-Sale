'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings, Store, Users as UsersIcon, Save, Plus, Mail, Lock, Shield, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile');
  const { user } = useAuth();
  
  // Profile state
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  // New user form state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState('cashier');

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const getToken = () => document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:8787/api/settings', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setStoreName(data.name || '');
        setStoreAddress(data.address || '');
        setStorePhone(data.phone || '');
        setTaxRate(data.taxRate || '0');
        setReceiptFooter(data.receiptFooter || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('http://localhost:8787/api/users', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        setUsersList(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch('http://localhost:8787/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          name: storeName,
          address: storeAddress,
          phone: storePhone,
          taxRate,
          receiptFooter
        })
      });
      if (res.ok) {
        alert('Pengaturan berhasil disimpan!');
      } else {
        alert('Gagal menyimpan pengaturan');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pegawai ini?')) return;
    try {
      const res = await fetch(`http://localhost:8787/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        alert('Pegawai berhasil dihapus');
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert('Gagal menghapus pegawai: ' + (errorData.message || 'Error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditUser = (u: any) => {
    setEditingUserId(u.id);
    setNewEmail(u.email);
    setNewFullName(u.fullName);
    setNewRole(u.role);
    setNewPassword(''); // Don't show existing password
    setNewPin(''); // Don't show existing pin
    setShowAddUser(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUserId ? `http://localhost:8787/api/users/${editingUserId}` : 'http://localhost:8787/api/users';
      const method = editingUserId ? 'PUT' : 'POST';
      
      const payload: any = {
        fullName: newFullName,
        role: newRole,
      };
      
      if (!editingUserId) {
        payload.email = newEmail;
        payload.password = newPassword;
        if (newPin) payload.pin = newPin;
      } else {
        if (newPassword) {
          payload.password = newPassword;
        }
        if (newPin) {
          payload.pin = newPin;
        }
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(editingUserId ? 'Pegawai berhasil diupdate!' : 'Pegawai berhasil ditambahkan!');
        setShowAddUser(false);
        setEditingUserId(null);
        setNewEmail('');
        setNewFullName('');
        setNewPassword('');
        setNewPin('');
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert('Gagal menyimpan pegawai: ' + (errorData.error || errorData.message || 'Error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Anda tidak memiliki akses ke halaman ini.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan</h1>
          <p className="text-slate-500 font-medium">Atur preferensi toko dan kelola hak akses karyawan Anda.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-slate-100/80 backdrop-blur-sm rounded-full mb-8 inline-flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
              activeTab === 'profile' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Store size={18} className="mr-2" />
            Profil Toko
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
              activeTab === 'users' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UsersIcon size={18} className="mr-2" />
            Karyawan & Akses
          </button>
        </div>

        {/* Tab Content: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
              <div className="p-2.5 bg-slate-50 text-slate-900 rounded-xl mr-3">
                <Store size={20} />
              </div>
              Informasi Toko
            </h2>
            
            {isLoadingProfile ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-100 rounded w-full"></div>
                <div className="h-10 bg-gray-100 rounded w-full"></div>
                <div className="h-24 bg-gray-100 rounded w-full"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Toko</label>
                    <input 
                      type="text" 
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none" 
                      placeholder="Contoh: Kopi Senopati"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nomor Telepon/WA</label>
                    <input 
                      type="text" 
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none" 
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap</label>
                  <textarea 
                    rows={3}
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none" 
                    placeholder="Alamat lengkap toko Anda"
                  />
                </div>

                <div className="border-t border-slate-100 pt-8 mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                    <div className="p-2.5 bg-slate-50 text-slate-900 rounded-xl mr-3">
                      <Settings size={18} />
                    </div>
                    Pengaturan Transaksi
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Pajak (PPN %)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none pr-10" 
                          placeholder="0"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Biarkan 0 jika tidak memungut pajak</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8 mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                    <div className="p-2.5 bg-slate-50 text-slate-900 rounded-xl mr-3">
                      <Settings size={18} />
                    </div>
                    Pengaturan Struk
                  </h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pesan Kaki Struk (Footer)</label>
                    <textarea 
                      rows={2}
                      value={receiptFooter}
                      onChange={(e) => setReceiptFooter(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none" 
                      placeholder="Contoh: Terima kasih telah berbelanja! Follow IG @toko_kami"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button 
                    onClick={saveSettings}
                    className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
                  >
                    <Save size={20} className="mr-2" />
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            {!showAddUser ? (
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden p-2">
                <div className="p-6 md:p-8 flex justify-between items-center bg-white rounded-t-[1.5rem]">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center mb-1">
                      <div className="p-2.5 bg-slate-50 text-slate-900 rounded-xl mr-3">
                        <Shield size={20} />
                      </div>
                      Daftar Pegawai
                    </h2>
                    <p className="text-slate-500 font-medium">Kelola akses untuk kasir dan supervisor.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingUserId(null);
                      setNewEmail('');
                      setNewFullName('');
                      setNewPassword('');
                      setNewPin('');
                      setShowAddUser(true);
                    }}
                    className="bg-slate-900 text-white hover:bg-black px-5 py-3 rounded-xl font-bold flex items-center hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                  >
                    <Plus size={18} className="mr-2" />
                    Tambah Pegawai
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="p-5 font-bold">Nama</th>
                        <th className="p-5 font-bold">Email</th>
                        <th className="p-5 font-bold">Role</th>
                        <th className="p-5 font-bold">Status</th>
                        <th className="p-5 font-bold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {isLoadingUsers ? (
                        <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-medium animate-pulse">Memuat data...</td></tr>
                      ) : usersList.length === 0 ? (
                        <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-medium">Belum ada pegawai.</td></tr>
                      ) : (
                        usersList.map((u, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="p-5">
                              <div className="font-bold text-slate-900 flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mr-4 font-bold text-sm border border-slate-200/50 shadow-sm">
                                  {u.fullName.charAt(0)}
                                </div>
                                {u.fullName}
                              </div>
                            </td>
                            <td className="p-5 text-slate-500 font-medium">{u.email}</td>
                            <td className="p-5">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                u.role === 'supervisor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {u.role === 'admin' ? 'Owner / Admin' : 
                                 u.role === 'supervisor' ? 'Supervisor' : 'Kasir'}
                              </span>
                            </td>
                            <td className="p-5">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200">
                                Aktif
                              </span>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditUser(u)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors">
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteUser(u.id)} className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-sm transition-colors">
                                  Hapus
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
            ) : (
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <div className="p-2.5 bg-slate-50 text-slate-900 rounded-xl mr-3">
                      <User size={20} />
                    </div>
                    {editingUserId ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
                  </h2>
                  <button 
                    onClick={() => setShowAddUser(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>

                <form onSubmit={saveUser} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none" 
                        placeholder="Contoh: Budi Santoso"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        required={!editingUserId}
                        disabled={!!editingUserId}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className={`w-full px-4 py-3.5 rounded-2xl transition-all outline-none ${editingUserId ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100'}`} 
                        placeholder="kasir1@toko.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Password Dashboard</label>
                      <input 
                        type="password" 
                        required={!editingUserId}
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none" 
                        placeholder={editingUserId ? "Kosongkan jika tidak ganti" : "Minimal 6 karakter"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">PIN POS (4 Angka)</label>
                      <input 
                        type="text" 
                        maxLength={4}
                        pattern="\d{4}"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none font-mono" 
                        placeholder={editingUserId ? "Kosongkan jika tidak ganti" : "Contoh: 1234"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Hak Akses (Role)</label>
                      <select 
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none font-medium text-slate-700 appearance-none"
                      >
                        <option value="cashier">Kasir (Hanya POS & Transaksi)</option>
                        <option value="supervisor">Supervisor (Akses Semua Kecuali Pengaturan)</option>
                        <option value="admin">Admin / Owner (Akses Penuh)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-8 border-t border-slate-100 mt-8">
                    <button 
                      type="submit"
                      className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
                    >
                      <Save size={20} className="mr-2" />
                      Simpan Pegawai
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
