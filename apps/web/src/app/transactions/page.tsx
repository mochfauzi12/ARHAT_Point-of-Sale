'use client';
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getTransactions, refundTransaction, voidTransaction } from '@/lib/api';
import { Search, RefreshCw, XCircle, Printer } from 'lucide-react';
import { PrintReceiptPortal } from '@/components/pos/ReceiptTemplate';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [printTx, setPrintTx] = useState<any>(null);

  const fetchTxs = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  const handleRefund = async (id: string) => {
    if (!confirm('Are you sure you want to refund this transaction? Stock will be restored.')) return;
    try {
      await refundTransaction(id);
      fetchTxs();
    } catch (err) {
      alert('Failed to refund');
    }
  };

  const handleVoid = async (id: string) => {
    if (!confirm('Are you sure you want to void this pending transaction?')) return;
    try {
      await voidTransaction(id);
      fetchTxs();
    } catch (err) {
      alert('Failed to void');
    }
  };

  const handlePrint = (tx: any) => {
    setPrintTx(tx);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintTx(null), 500);
    }, 100);
  };

  const filtered = transactions.filter(t => 
    t.transactionNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transactions</h1>
          <p className="text-slate-500 font-medium">Manage recent sales, refunds, and held carts.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search receipt..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
            />
          </div>
          <button onClick={fetchTxs} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
            <RefreshCw size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                <th className="p-5 font-bold">Receipt No.</th>
                <th className="p-5 font-bold">Date</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold">Method</th>
                <th className="p-5 font-bold text-right">Total</th>
                <th className="p-5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500 font-medium animate-pulse">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">No transactions found.</td>
                </tr>
              ) : filtered.map(tx => (
                <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 font-bold text-slate-900">{tx.transactionNumber}</td>
                  <td className="p-5 text-slate-500 font-medium">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      tx.status === 'held' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      tx.status === 'refunded' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-5 text-slate-500 font-medium">{tx.paymentMethod || '-'}</td>
                  <td className="p-5 text-right font-bold text-slate-900">
                    Rp {Number(tx.totalAmount).toLocaleString('id-ID')}
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {tx.status === 'completed' && (
                        <button onClick={() => handleRefund(tx.id)} title="Refund" className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">
                          <RefreshCw size={16} />
                        </button>
                      )}
                      {(tx.status === 'pending' || tx.status === 'held') && (
                        <button onClick={() => handleVoid(tx.id)} title="Void" className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                          <XCircle size={16} />
                        </button>
                      )}
                      {tx.status === 'completed' && (
                        <button onClick={() => handlePrint(tx)} title="Print Receipt" className="p-2 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-200 transition-colors">
                          <Printer size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {printTx && <PrintReceiptPortal transaction={printTx} />}
    </DashboardLayout>
  );
}
