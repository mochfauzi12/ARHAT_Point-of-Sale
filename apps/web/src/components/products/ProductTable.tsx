import React, { useState } from 'react';
import { Edit2, Trash2, Search } from 'lucide-react';

interface ProductTableProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Search products by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 focus:outline-none transition-all duration-300"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
              <th className="pb-4 font-bold pl-2">Product Name</th>
              <th className="pb-4 font-bold">SKU</th>
              <th className="pb-4 font-bold">Category</th>
              <th className="pb-4 font-bold text-right">Price</th>
              <th className="pb-4 font-bold text-right">Stock</th>
              <th className="pb-4 font-bold text-center">Status</th>
              <th className="pb-4 font-bold text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors duration-200 group">
                <td className="py-4 pl-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 shadow-sm border border-slate-200/50">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                          {p.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-slate-900 group-hover:text-[#0B5A63] transition-colors">{p.name}</span>
                  </div>
                </td>
                <td className="py-4 text-slate-500 font-medium">{p.sku || '-'}</td>
                <td className="py-4 text-slate-500 capitalize font-medium">
                  {p.category || 'General'}
                  {p.isService && <span className="ml-2 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-semibold border border-blue-100">Jasa</span>}
                </td>
                <td className="py-4 font-bold text-slate-900 text-right">Rp {parseFloat(p.sellingPrice || '0').toLocaleString('id-ID')}</td>
                <td className="py-4 text-right font-medium text-slate-600">
                  {p.isService ? <span className="text-slate-300">-</span> : (p.stockQuantity || 0)}
                </td>
                <td className="py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 text-right pr-2">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(p)}
                      className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(p.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
