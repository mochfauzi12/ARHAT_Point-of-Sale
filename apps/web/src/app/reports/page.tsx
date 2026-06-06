'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  BarChart3, Download, TrendingUp, DollarSign, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCcw
} from 'lucide-react';
import { getSalesAnalytics, getProductAnalytics, getProfitLoss } from '@/lib/api';

const COLORS = ['#0d9488', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'penjualan' | 'labaRugi' | 'produk'>('ringkasan');
  const [isLoading, setIsLoading] = useState(true);
  
  const [salesData, setSalesData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [plData, setPlData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sales, products, pl] = await Promise.all([
        getSalesAnalytics(),
        getProductAnalytics(),
        getProfitLoss()
      ]);
      setSalesData(sales);
      setProductData(products);
      setPlData(pl);
    } catch (error) {
      console.error('Failed to load reports', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = () => {
    alert("Fitur Export PDF akan segera hadir!");
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan & Analitik</h1>
            <p className="text-sm text-gray-500 mt-1">Pantau performa bisnis dan penjualan Anda.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchData}
              className="flex items-center justify-center p-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
            >
              <Download size={18} />
              <span className="font-medium">Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white border border-gray-200 p-1 rounded-xl w-full max-w-2xl mb-6 overflow-x-auto">
          {[
            { id: 'ringkasan', label: 'Ringkasan' },
            { id: 'penjualan', label: 'Penjualan' },
            { id: 'labaRugi', label: 'Laba Rugi' },
            { id: 'produk', label: 'Performa Produk' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* TAB: RINGKASAN */}
            {activeTab === 'ringkasan' && salesData && plData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <DollarSign size={24} />
                      </div>
                      <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        30 Hari
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Pendapatan</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(salesData.totalRevenue)}</h3>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <TrendingUp size={24} />
                      </div>
                      <span className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        Margin: {plData.margin.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Laba Kotor</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(plData.grossProfit)}</h3>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <Package size={24} />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Transaksi</p>
                    <h3 className="text-2xl font-bold text-gray-900">{salesData.totalTransactions} <span className="text-sm font-normal text-gray-500">transaksi</span></h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Tren Penjualan (30 Hari Terakhir)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `Rp${val/1000}k`} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                          labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} dot={false} activeDot={{r: 8, fill: '#0d9488', stroke: '#fff', strokeWidth: 2}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* TAB: PENJUALAN */}
            {activeTab === 'penjualan' && salesData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Penjualan Harian</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `Rp${val/1000}k`} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                          cursor={{fill: '#f3f4f6'}}
                        />
                        <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Metode Pembayaran</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesData.paymentMethodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {salesData.paymentMethodData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: LABA RUGI */}
            {activeTab === 'labaRugi' && plData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Pendapatan</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(plData.totalRevenue)}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <p className="text-sm font-medium text-gray-500 mb-1">Harga Pokok Penjualan (HPP)</p>
                    <h3 className="text-2xl font-bold text-red-600">- {formatCurrency(plData.totalCOGS)}</h3>
                  </div>
                  <div className="bg-teal-600 p-6 rounded-2xl shadow-sm text-center text-white">
                    <p className="text-sm font-medium text-teal-100 mb-1">Laba Kotor</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(plData.grossProfit)}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Pergerakan Laba (30 Hari)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={plData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `Rp${val/1000}k`} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="profit" name="Laba" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRODUK */}
            {activeTab === 'produk' && productData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="text-teal-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">Produk Terlaris (Qty)</h3>
                  </div>
                  <div className="space-y-4">
                    {productData.topProductsByQty.map((product: any, idx: number) => (
                      <div key={product.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-teal-600">{product.totalQuantity} <span className="text-xs font-normal text-gray-500">terjual</span></p>
                          <p className="text-xs font-medium text-gray-500">{formatCurrency(product.totalRevenue)}</p>
                        </div>
                      </div>
                    ))}
                    {productData.topProductsByQty.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Belum ada data penjualan produk.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle className="text-amber-500" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">Produk Kurang Laku / Stuck</h3>
                  </div>
                  <div className="space-y-4">
                    {productData.slowMoving.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-amber-600 font-medium">Sisa stok: {product.stock}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-700">{product.totalQuantity} <span className="text-xs font-normal text-gray-500">terjual</span></p>
                        </div>
                      </div>
                    ))}
                    {productData.slowMoving.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Semua produk terjual dengan baik!</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
