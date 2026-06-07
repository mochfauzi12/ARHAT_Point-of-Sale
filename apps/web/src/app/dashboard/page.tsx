'use client';
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getDashboardAnalytics } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CreditCard, Package, ArrowUpRight } from 'lucide-react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getDashboardAnalytics();
        setData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="text-slate-500 font-medium">Here's what's happening in your store today.</p>
        </div>

        {loading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-50 h-32 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-50 h-96 rounded-3xl border border-slate-100/60"></div>
              <div className="bg-slate-50 h-96 rounded-3xl border border-slate-100/60"></div>
            </div>
          </div>
        ) : !data ? (
          <div className="flex h-64 items-center justify-center bg-red-50 rounded-3xl border border-red-100">
            <p className="text-red-500 font-medium">Failed to load analytics data.</p>
          </div>
        ) : data.activeProducts === 0 && data.todayTransactions === 0 ? (
          <div className="bg-gradient-to-br from-teal-50 to-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-teal-100/50 flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-teal-900/5 border border-teal-50">
              <Package size={48} className="text-teal-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
              Selamat Datang di Toko Baru Anda! 🎉
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mb-10 leading-relaxed">
              Toko Anda sudah siap digunakan, tapi sistem kami melihat Anda belum memiliki produk apapun untuk dijual. Mari tambahkan produk pertama Anda agar kasir bisa mulai melayani pembeli.
            </p>
            <a href="/products" className="group relative flex justify-center items-center gap-3 rounded-2xl bg-[#0B5A63] px-8 py-5 text-base font-bold text-white hover:bg-[#0E8A94] transition-all shadow-lg shadow-teal-900/20 hover:shadow-xl hover:shadow-teal-900/30 hover:-translate-y-1">
              <Package size={20} />
              <span>Tambah Produk Pertama Anda</span>
              <ArrowUpRight size={20} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        ) : (
          <>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <span className="flex items-center text-sm font-medium text-teal-600 bg-teal-50/50 px-2.5 py-1 rounded-full">
              <ArrowUpRight size={16} className="mr-1" /> +12%
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Revenue</h3>
          <p className="text-3xl font-bold">Rp {data.todayRevenue.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <CreditCard size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Transactions</h3>
          <p className="text-3xl font-bold text-slate-900">{data.todayTransactions}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Package size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Products</h3>
          <p className="text-3xl font-bold">{data.activeProducts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
          <h2 className="text-lg font-bold mb-6 text-slate-900">Revenue Last 7 Days</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B5A63" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0B5A63" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0B5A63" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
          <h2 className="text-lg font-bold mb-6 text-slate-900">Top Products (Best Sellers)</h2>
          <div className="space-y-6">
            {data.topProducts.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-500">
                    #{i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.totalQuantity} items sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">Rp {Number(p.totalRevenue).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
            {data.topProducts.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No sales data available yet.</p>
            )}
          </div>
        </div>
      </div>
          </>
        )}
      </ErrorBoundary>
    </DashboardLayout>
  );
}
