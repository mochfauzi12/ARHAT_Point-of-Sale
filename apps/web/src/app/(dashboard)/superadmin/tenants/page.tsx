'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSuperadminTenants, deactivateTenant, activateTenant, deleteTenant } from '@/lib/api';
import { Building, Users, Search, ArrowLeft, MoreVertical, Trash2, Ban, CheckCircle, Mail, Calendar, AlertTriangle, X, Loader2 } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  created_at: string;
  outlet_count: number;
  user_count: number;
}

type ModalAction = 'deactivate' | 'activate' | 'delete' | null;

export default function SuperadminTenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const dropdownRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await fetchSuperadminTenants();
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: ModalAction, tenant: Tenant) => {
    setSelectedTenant(tenant);
    setModalAction(action);
    setOpenDropdown(null);
  };

  const confirmAction = async () => {
    if (!selectedTenant || !modalAction) return;
    setActionLoading(true);
    try {
      if (modalAction === 'deactivate') {
        await deactivateTenant(selectedTenant.id);
      } else if (modalAction === 'activate') {
        await activateTenant(selectedTenant.id);
      } else if (modalAction === 'delete') {
        await deleteTenant(selectedTenant.id);
      }
      await loadTenants();
      setModalAction(null);
      setSelectedTenant(null);
    } catch (err: any) {
      alert('Gagal: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Back button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors mb-3 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Tenant</h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat dan kelola semua bisnis yang menggunakan aplikasi Transaksi Kita.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari tenant atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Tenant</p>
            <p className="text-2xl font-bold text-slate-900">{tenants.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pengguna (Semua)</p>
            <p className="text-2xl font-bold text-slate-900">
              {tenants.reduce((acc, curr) => acc + Number(curr.user_count || 0), 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Cabang/Outlet</p>
            <p className="text-2xl font-bold text-slate-900">
              {tenants.reduce((acc, curr) => acc + Number(curr.outlet_count || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
            Memuat data tenant...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 font-medium">Error: {error}</div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Tidak ada tenant ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-sm text-slate-500">
                  <th className="font-semibold py-4 px-6">Nama Bisnis (Tenant)</th>
                  <th className="font-semibold py-4 px-6 hidden sm:table-cell">Email Owner</th>
                  <th className="font-semibold py-4 px-6 text-center">Outlet</th>
                  <th className="font-semibold py-4 px-6 text-center">Users</th>
                  <th className="font-semibold py-4 px-6 hidden md:table-cell">Tanggal Daftar</th>
                  <th className="font-semibold py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{tenant.name}</div>
                      <div className="text-xs text-slate-500 sm:hidden mt-0.5">{tenant.email}</div>
                    </td>
                    <td className="py-4 px-6 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {tenant.email}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                        {tenant.outlet_count}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                        {tenant.user_count}
                      </span>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right relative" ref={openDropdown === tenant.id ? dropdownRef as any : null}>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === tenant.id ? null : tenant.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdown === tenant.id && (
                        <div className="absolute right-6 top-12 z-30 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={() => handleAction('deactivate', tenant)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Ban size={16} />
                            Nonaktifkan Tenant
                          </button>
                          <button
                            onClick={() => handleAction('activate', tenant)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle size={16} />
                            Aktifkan Tenant
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            onClick={() => handleAction('delete', tenant)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                            Hapus Tenant
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalAction && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                modalAction === 'delete' ? 'bg-red-100 text-red-600' :
                modalAction === 'deactivate' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {modalAction === 'delete' ? <Trash2 size={24} /> :
                 modalAction === 'deactivate' ? <Ban size={24} /> :
                 <CheckCircle size={24} />}
              </div>
              <button onClick={() => { setModalAction(null); setSelectedTenant(null); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {modalAction === 'delete' ? 'Hapus Tenant' :
                 modalAction === 'deactivate' ? 'Nonaktifkan Tenant' :
                 'Aktifkan Tenant'}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                {modalAction === 'delete' ? (
                  <>Apakah Anda yakin ingin <strong className="text-red-600">menghapus permanen</strong> tenant <strong>{selectedTenant.name}</strong>? Semua data (produk, transaksi, karyawan, dll.) akan dihapus dan <strong>tidak dapat dikembalikan</strong>.</>
                ) : modalAction === 'deactivate' ? (
                  <>Semua user milik tenant <strong>{selectedTenant.name}</strong> akan di-nonaktifkan dan <strong>tidak bisa login</strong> sampai Anda mengaktifkannya kembali.</>
                ) : (
                  <>Semua user milik tenant <strong>{selectedTenant.name}</strong> akan diaktifkan kembali dan <strong>bisa login</strong> seperti biasa.</>
                )}
              </p>
            </div>

            {modalAction === 'delete' && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600 font-medium">Tindakan ini bersifat permanen dan tidak dapat dibatalkan!</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setModalAction(null); setSelectedTenant(null); }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
                  modalAction === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                  modalAction === 'deactivate' ? 'bg-amber-500 hover:bg-amber-600' :
                  'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                {modalAction === 'delete' ? 'Ya, Hapus' :
                 modalAction === 'deactivate' ? 'Ya, Nonaktifkan' :
                 'Ya, Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
