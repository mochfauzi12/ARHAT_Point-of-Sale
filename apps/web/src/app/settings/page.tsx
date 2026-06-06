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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-sm text-gray-500 mt-1">Atur preferensi toko dan kelola hak akses karyawan Anda.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'profile' 
                ? 'bg-teal-50 text-teal-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Store size={18} className="mr-2" />
            Profil Toko
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'users' 
                ? 'bg-teal-50 text-teal-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UsersIcon size={18} className="mr-2" />
            Karyawan & Akses
          </button>
        </div>

        {/* Tab Content: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <Store size={20} className="mr-2 text-teal-600" />
              Informasi Toko
            </h2>
            
            {isLoadingProfile ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-100 rounded w-full"></div>
                <div className="h-10 bg-gray-100 rounded w-full"></div>
                <div className="h-24 bg-gray-100 rounded w-full"></div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
                    <input 
                      type="text" 
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500" 
                      placeholder="Contoh: Kopi Senopati"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon/WA</label>
                    <input 
                      type="text" 
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500" 
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                  <textarea 
                    rows={3}
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500" 
                    placeholder="Alamat lengkap toko Anda"
                  />
                </div>

                <div className="border-t border-gray-100 pt-5 mt-5">
                  <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center">
                    <Settings size={18} className="mr-2 text-teal-600" />
                    Pengaturan Transaksi
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pajak (PPN %)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          className="w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500 pl-4 pr-10" 
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-2.5 text-gray-400 font-medium">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Biarkan 0 jika tidak memungut pajak</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5 mt-5">
                  <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center">
                    <Settings size={18} className="mr-2 text-teal-600" />
                    Pengaturan Struk
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pesan Kaki Struk (Footer)</label>
                    <textarea 
                      rows={2}
                      value={receiptFooter}
                      onChange={(e) => setReceiptFooter(e.target.value)}
                      className="w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500" 
                      placeholder="Contoh: Terima kasih telah berbelanja! Follow IG @toko_kami"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={saveSettings}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center transition-colors"
                  >
                    <Save size={18} className="mr-2" />
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {!showAddUser ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                      <Shield size={20} className="mr-2 text-teal-600" />
                      Daftar Pegawai
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola akses untuk kasir dan supervisor.</p>
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
                    className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-xl font-medium flex items-center transition-colors"
                  >
                    <Plus size={18} className="mr-2" />
                    Tambah Pegawai
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoadingUsers ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
                      ) : usersList.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">Belum ada pegawai.</td></tr>
                      ) : (
                        usersList.map((u, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <div className="font-medium text-gray-900 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mr-3 font-bold text-xs">
                                  {u.fullName.charAt(0)}
                                </div>
                                {u.fullName}
                              </div>
                            </td>
                            <td className="p-4 text-gray-600">{u.email}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                u.role === 'supervisor' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {u.role === 'admin' ? 'Owner / Admin' : 
                                 u.role === 'supervisor' ? 'Supervisor' : 'Kasir'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-gray-600 bg-gray-100">
                                Aktif
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleEditUser(u)} className="text-teal-600 hover:text-teal-900 mr-3 font-medium text-sm">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <User size={20} className="mr-2 text-teal-600" />
                    {editingUserId ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
                  </h2>
                  <button 
                    onClick={() => setShowAddUser(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    Batal
                  </button>
                </div>

                <form onSubmit={saveUser} className="space-y-5 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        className="w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500" 
                        placeholder="Contoh: Budi Santoso"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        required={!editingUserId}
                        disabled={!!editingUserId}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className={`w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500 ${editingUserId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
                        placeholder="kasir1@toko.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password Dashboard</label>
                      <input 
                        type="password" 
                        required={!editingUserId}
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500" 
                        placeholder={editingUserId ? "Kosongkan jika tidak ganti password" : "Minimal 6 karakter"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN POS (4 Angka)</label>
                      <input 
                        type="text" 
                        maxLength={4}
                        pattern="\d{4}"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500" 
                        placeholder={editingUserId ? "Kosongkan jika tidak ganti PIN" : "Contoh: 1234"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hak Akses (Role)</label>
                      <select 
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="cashier">Kasir (Hanya POS & Transaksi)</option>
                        <option value="supervisor">Supervisor (Akses Semua Kecuali Pengaturan)</option>
                        <option value="admin">Admin / Owner (Akses Penuh)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
                    <button 
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center transition-colors"
                    >
                      <Save size={18} className="mr-2" />
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
