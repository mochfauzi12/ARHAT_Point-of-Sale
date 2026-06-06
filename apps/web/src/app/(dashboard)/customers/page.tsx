'use client';

import { useState, useEffect } from 'react';
import { getCustomers, createCustomer } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  async function fetchCustomers() {
    try {
      const data = await getCustomers(search);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await createCustomer({ name, phone, email, notes });
      setIsModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setNotes('');
      fetchCustomers();
    } catch (err) {
      alert('Gagal menambah pelanggan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
            <p className="text-sm text-gray-500">Kelola database pelanggan dan poin loyalitas</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0B5A63] text-white px-4 py-2 rounded-xl hover:bg-[#09474f] transition-colors"
          >
            + Tambah Pelanggan
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <input 
            type="text" 
            placeholder="Cari nama atau telepon..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border rounded-xl"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600">Nama</th>
                <th className="p-4 font-semibold text-gray-600">Telepon / Email</th>
                <th className="p-4 font-semibold text-gray-600">Total Belanja</th>
                <th className="p-4 font-semibold text-gray-600">Poin Aktif</th>
                <th className="p-4 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Belum ada pelanggan.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4">
                      <div className="text-sm">{c.phone || '-'}</div>
                      <div className="text-xs text-gray-500">{c.email || ''}</div>
                    </td>
                    <td className="p-4 text-sm">Rp {parseInt(c.totalSpent || '0').toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <span className="bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold px-3 py-1 rounded-full">
                        {parseInt(c.points || '0').toLocaleString('id-ID')} Pts
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-teal-600 hover:underline text-sm font-medium">Detail</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-[#0B5A63]">Tambah Pelanggan Baru</h2>
              <form onSubmit={handleAddCustomer}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan *</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border rounded-xl px-3 py-2" rows={2} />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">Batal</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0B5A63] text-white rounded-xl hover:bg-[#09474f] font-medium transition-colors">
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
