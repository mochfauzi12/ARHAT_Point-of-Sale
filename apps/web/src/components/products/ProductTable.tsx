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
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500">
              <th className="pb-4 font-medium pl-2">Product Name</th>
              <th className="pb-4 font-medium">SKU</th>
              <th className="pb-4 font-medium">Category</th>
              <th className="pb-4 font-medium text-right">Price</th>
              <th className="pb-4 font-medium text-right">Stock</th>
              <th className="pb-4 font-medium text-center">Status</th>
              <th className="pb-4 font-medium text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-4 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                          {p.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                </td>
                <td className="py-4 text-gray-500">{p.sku || '-'}</td>
                <td className="py-4 text-gray-500 capitalize">{p.category || 'General'}</td>
                <td className="py-4 font-medium text-right">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="py-4 text-right">{p.stock}</td>
                <td className="py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
