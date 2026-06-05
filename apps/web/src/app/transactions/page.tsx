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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-gray-500 mt-1">Manage recent sales, refunds, and held carts.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search receipt..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <button onClick={fetchTxs} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-medium">Receipt No.</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium text-right">Total</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No transactions found.</td>
                </tr>
              ) : filtered.map(tx => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 font-medium text-gray-900">{tx.transactionNumber}</td>
                  <td className="p-4 text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      tx.status === 'completed' ? 'bg-green-50 text-green-600' :
                      tx.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                      tx.status === 'held' ? 'bg-blue-50 text-blue-600' :
                      tx.status === 'refunded' ? 'bg-red-50 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{tx.paymentMethod || '-'}</td>
                  <td className="p-4 text-right font-semibold text-gray-900">
                    Rp {Number(tx.totalAmount).toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {tx.status === 'completed' && (
                        <button onClick={() => handleRefund(tx.id)} title="Refund" className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                          <RefreshCw size={16} />
                        </button>
                      )}
                      {(tx.status === 'pending' || tx.status === 'held') && (
                        <button onClick={() => handleVoid(tx.id)} title="Void" className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                          <XCircle size={16} />
                        </button>
                      )}
                      {tx.status === 'completed' && (
                        <button onClick={() => handlePrint(tx)} title="Print Receipt" className="p-1.5 bg-gray-100 text-black rounded-lg hover:bg-gray-200">
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
