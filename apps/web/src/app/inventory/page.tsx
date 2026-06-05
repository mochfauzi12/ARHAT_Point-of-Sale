'use client';
import React, { useState, useEffect } from 'react';
import { 
  fetchOutlets, createOutlet, fetchProductStockByOutlet, recordStockMovement, 
  fetchAdjustments, createAdjustment, approveAdjustment,
  createOpname, completeOpname,
  createTransfer, receiveTransfer, getInventoryMovements
} from '@/lib/api';
import { Package, Plus, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, Building, CheckCircle, Store, Send } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function InventoryPage() {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'stockInOut' | 'adjustments' | 'opname' | 'transfers'>('monitoring');

  // Modals state
  const [showAddOutlet, setShowAddOutlet] = useState(false);
  const [newOutletName, setNewOutletName] = useState('');

  useEffect(() => {
    loadOutlets();
  }, []);

  useEffect(() => {
    if (selectedOutlet) {
      loadOutletData(selectedOutlet);
    }
  }, [selectedOutlet, activeTab]);

  const loadOutlets = async () => {
    try {
      const data = await fetchOutlets();
      setOutlets(data);
      if (data.length > 0 && !selectedOutlet) {
        setSelectedOutlet(data[0].id);
      } else if (data.length === 0) {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadOutletData = async (outletId: string) => {
    setLoading(true);
    try {
      if (activeTab === 'monitoring') {
        const [prods, movs] = await Promise.all([
          fetchProductStockByOutlet(outletId),
          getInventoryMovements()
        ]);
        setProducts(prods);
        setMovements(movs.filter((m: any) => m.outletId === outletId || m.outletId === null));
      } else if (activeTab === 'stockInOut' || activeTab === 'opname' || activeTab === 'adjustments' || activeTab === 'transfers') {
        const prods = await fetchProductStockByOutlet(outletId);
        setProducts(prods);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const outlet = await createOutlet(newOutletName, '');
      setOutlets([...outlets, outlet]);
      setSelectedOutlet(outlet.id);
      setShowAddOutlet(false);
      setNewOutletName('');
    } catch (e) {
      alert('Failed to create outlet');
    }
  };

  if (loading && outlets.length === 0) return <div className="p-8">Loading inventory...</div>;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header & Outlet Selector */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage stock across multiple outlets</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
              <Store size={18} className="text-gray-500" />
              <select 
                value={selectedOutlet} 
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="bg-transparent font-medium focus:outline-none"
              >
                {outlets.length === 0 && <option value="">No Outlet</option>}
                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <button 
              onClick={() => setShowAddOutlet(true)}
              className="p-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
              title="Add Outlet"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {outlets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <Building size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Outlets Found</h2>
            <p className="text-gray-500 max-w-md mb-8">You need to create at least one outlet to start managing inventory.</p>
            <button onClick={() => setShowAddOutlet(true)} className="px-6 py-3 bg-black text-white rounded-xl font-medium">
              Create First Outlet
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6 shrink-0 bg-white">
              {[
                { id: 'monitoring', label: 'Monitoring' },
                { id: 'stockInOut', label: 'Stock In/Out' },
                { id: 'adjustments', label: 'Adjustments' },
                { id: 'opname', label: 'Opname (Audit)' },
                { id: 'transfers', label: 'Transfers' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-black text-black' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {loading ? (
                <div className="text-gray-500">Loading data...</div>
              ) : (
                <>
                  {activeTab === 'monitoring' && <MonitoringTab products={products} movements={movements} />}
                  {activeTab === 'stockInOut' && <StockInOutTab outletId={selectedOutlet} products={products} reload={() => loadOutletData(selectedOutlet)} />}
                  {activeTab === 'adjustments' && <AdjustmentsTab outletId={selectedOutlet} products={products} />}
                  {activeTab === 'opname' && <OpnameTab outletId={selectedOutlet} products={products} reload={() => loadOutletData(selectedOutlet)} />}
                  {activeTab === 'transfers' && <TransfersTab outletId={selectedOutlet} outlets={outlets} products={products} reload={() => loadOutletData(selectedOutlet)} />}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddOutlet && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold mb-4">New Outlet</h3>
            <form onSubmit={handleCreateOutlet} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outlet Name</label>
                <input 
                  required autoFocus type="text" 
                  value={newOutletName} onChange={e => setNewOutletName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50" placeholder="e.g. Main Store"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowAddOutlet(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-medium">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ================= TABS COMPONENTS =================

function MonitoringTab({ products, movements }: { products: any[], movements: any[] }) {
  const lowStock = products.filter(p => parseInt(p.stockQuantity) <= parseInt(p.minStockLevel || '0'));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        {lowStock.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-4 items-start">
            <AlertTriangle className="text-orange-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-orange-800">Low Stock Alert</h4>
              <p className="text-sm text-orange-700 mt-1">{lowStock.length} product(s) are at or below minimum stock level.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lowStock.map(p => (
                  <span key={p.id} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-md font-medium">
                    {p.name} ({p.stockQuantity} left)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-6">Current Stock</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-100">
                  <th className="pb-4 font-medium">Product</th>
                  <th className="pb-4 font-medium">Min Level</th>
                  <th className="pb-4 font-medium">Stock Qty</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 font-medium">{p.name}</td>
                    <td className="py-4 text-gray-500">{p.minStockLevel || 0}</td>
                    <td className="py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        parseInt(p.stockQuantity) <= parseInt(p.minStockLevel || '0') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {p.stockQuantity || 0}
                      </span>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={3} className="py-8 text-center text-gray-500">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
        <h3 className="font-semibold text-lg mb-6">Recent Movements</h3>
        <div className="flex flex-col gap-4">
          {movements.slice(0, 10).map(m => (
            <div key={m.id} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                m.movementType === 'in' || m.movementType === 'transfer_in' ? 'bg-green-100 text-green-600' : 
                m.movementType === 'adjustment' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
              }`}>
                {(m.movementType === 'in' || m.movementType === 'transfer_in') ? <ArrowDownRight size={18} /> : 
                 m.movementType === 'adjustment' ? <RefreshCw size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div>
                <p className="font-medium text-gray-900 truncate max-w-[150px]">{m.productName}</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {m.movementType} • {m.reason || 'No reason'}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {(m.movementType === 'in' || m.movementType === 'transfer_in') ? '+' : '-'}{m.quantity}
              </div>
            </div>
          ))}
          {movements.length === 0 && <p className="text-gray-500 text-center">No movements</p>}
        </div>
      </div>
    </div>
  );
}

function StockInOutTab({ outletId, products, reload }: any) {
  const [type, setType] = useState<'in'|'out'>('in');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity) return;
    setSubmitting(true);
    try {
      await recordStockMovement(outletId, productId, type, parseInt(quantity), reason);
      alert('Success!');
      setQuantity('');
      setReason('');
      reload();
    } catch (e: any) {
      alert(e.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="text-xl font-bold mb-6">Manual Stock Entry</h3>
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
        <button type="button" onClick={() => setType('in')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${type === 'in' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Stock IN</button>
        <button type="button" onClick={() => setType('out')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${type === 'out' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Stock OUT</button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <select required value={productId} onChange={e => setProductId(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50">
            <option value="">Select product...</option>
            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity || 0})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input required type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50" placeholder="e.g. 50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Reference</label>
          <input required type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50" placeholder={type === 'in' ? 'e.g. Supplier PO #123' : 'e.g. Expired, Damaged'} />
        </div>
        <button disabled={submitting} type="submit" className={`mt-2 py-3 rounded-xl font-bold text-white transition-colors ${type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>
          {submitting ? 'Processing...' : `Submit Stock ${type.toUpperCase()}`}
        </button>
      </form>
    </div>
  );
}

function AdjustmentsTab({ outletId, products }: any) {
  const [adjs, setAdjs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAdjs();
  }, [outletId]);

  const loadAdjs = async () => {
    setLoading(true);
    try {
      const data = await fetchAdjustments(outletId);
      setAdjs(data);
    } catch(e) {}
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAdjustment(id);
      loadAdjs();
    } catch (e) { alert('Failed'); }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Stock Adjustments</h3>
        {/* Placeholder for "New Adjustment" button */}
      </div>
      {loading ? <p>Loading...</p> : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-100">
              <th className="pb-4">Adj Number</th>
              <th className="pb-4">Date</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {adjs.map(a => (
              <tr key={a.id} className="border-b border-gray-50">
                <td className="py-4 font-medium">{a.adjustmentNumber}</td>
                <td className="py-4 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${a.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.status}</span>
                </td>
                <td className="py-4">
                  {a.status === 'pending' && (
                    <button onClick={() => handleApprove(a.id)} className="text-blue-600 font-medium hover:underline">Approve</button>
                  )}
                </td>
              </tr>
            ))}
            {adjs.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-500">No adjustments found</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OpnameTab({ outletId, products, reload }: any) {
  const [session, setSession] = useState<any>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  
  const handleStart = async () => {
    try {
      const res = await createOpname(outletId);
      setSession(res);
      // init counts
      const init: Record<string, number> = {};
      products.forEach((p: any) => init[p.id] = parseInt(p.stockQuantity || '0'));
      setCounts(init);
    } catch (e) { alert('Failed to start opname'); }
  };

  const handleComplete = async () => {
    try {
      const items = Object.entries(counts).map(([productId, actualQuantity]) => ({ productId, actualQuantity }));
      await completeOpname(session.id, items);
      setSession(null);
      alert('Opname completed and adjustments applied!');
      reload();
    } catch (e) { alert('Failed to complete opname'); }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
        <CheckCircle size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-bold mb-2">Stock Opname</h3>
        <p className="text-gray-500 max-w-sm mb-6">Perform physical counts of your inventory to ensure system accuracy.</p>
        <button onClick={handleStart} className="px-6 py-3 bg-black text-white font-medium rounded-xl">Start New Session</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Active Opname: {session.opnameNumber}</h3>
          <p className="text-sm text-gray-500">Input the actual physical quantity for each product.</p>
        </div>
        <button onClick={handleComplete} className="px-6 py-2 bg-black text-white font-medium rounded-xl">Complete Opname</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="p-4 rounded-l-xl">Product</th>
              <th className="p-4 text-center">System Stock</th>
              <th className="p-4 rounded-r-xl">Actual Count</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-center text-gray-500">{p.stockQuantity || 0}</td>
                <td className="p-4">
                  <input 
                    type="number" min="0" 
                    value={counts[p.id] ?? ''} 
                    onChange={e => setCounts({...counts, [p.id]: parseInt(e.target.value) || 0})}
                    className="w-32 border border-gray-300 rounded-lg p-2 text-center"
                  />
                  {counts[p.id] !== parseInt(p.stockQuantity || '0') && (
                    <span className="ml-3 text-sm font-medium text-orange-500">
                      Variance: {counts[p.id] - parseInt(p.stockQuantity || '0')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransfersTab({ outletId, outlets, products, reload }: any) {
  const [destId, setDestId] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destId || !productId || !qty) return;
    try {
      await createTransfer(outletId, destId, [{ productId, quantity: parseInt(qty) }]);
      alert('Transfer requested!');
      setQty('');
      reload();
    } catch (e: any) { alert(e.message); }
  };

  const otherOutlets = outlets.filter((o: any) => o.id !== outletId);

  if (otherOutlets.length === 0) {
    return <div className="p-8 text-center text-gray-500 bg-white rounded-3xl">You need at least 2 outlets to perform transfers.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Send className="text-blue-500" />
          <h3 className="text-xl font-bold">New Transfer</h3>
        </div>
        <form onSubmit={handleTransfer} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Outlet</label>
            <select required value={destId} onChange={e => setDestId(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50">
              <option value="">Select destination...</option>
              {otherOutlets.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select required value={productId} onChange={e => setProductId(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50">
              <option value="">Select product...</option>
              {products.filter((p: any) => parseInt(p.stockQuantity) > 0).map((p: any) => <option key={p.id} value={p.id}>{p.name} (Max: {p.stockQuantity})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input required type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50" />
          </div>
          <button type="submit" className="mt-2 py-3 bg-black text-white rounded-xl font-bold">Send Transfer</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Incoming Transfers</h3>
        <p className="text-gray-500 text-sm">Transfers sent to {outlets.find((o: any) => o.id === outletId)?.name} will appear here.</p>
        {/* We would fetch and list pending transfers to this outlet here and have a 'Receive' button */}
        <div className="mt-8 text-center text-gray-400 italic">No incoming transfers</div>
      </div>
    </div>
  );
}
