'use client';
import React from 'react';
import { useCartStore } from '@/store/useCartStore';

export function HeldTransactionsModal({ onClose }: { onClose: () => void }) {
  const { heldTransactions, resumeTransaction, removeHeldTransaction } = useCartStore();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Held Transactions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            ✕
          </button>
        </div>

        {heldTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions on hold.
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
            {heldTransactions.map((tx) => (
              <div key={tx.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{tx.note || 'No Note'}</h3>
                    <p className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                    {tx.items.length} items
                  </span>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      resumeTransaction(tx.id);
                      onClose();
                    }}
                    className="flex-1 bg-black text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-800"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => removeHeldTransaction(tx.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
