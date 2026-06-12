'use client';

import React, { useState, useEffect } from 'react';
import { fetchSuperadminTenants } from '@/lib/api';
import { Building, Users, Calendar, Mail, Search, ArrowUpDown, ChevronRight } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  created_at: string;
  outlet_count: number;
  user_count: number;
}

export default function SuperadminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const data = await fetchSuperadminTenants();
        setTenants(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load tenants');
      } finally {
        setLoading(false);
      }
    };
    loadTenants();
  }, []);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
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
          <div className="p-12 text-center text-slate-500">Memuat data tenant...</div>
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
                    <td className="py-4 px-6 text-right">
                      <button className="text-teal-600 hover:text-teal-700 p-2 rounded-lg hover:bg-teal-50 transition-colors inline-flex items-center justify-center">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
