'use client';
import { Search } from 'lucide-react';
import React from 'react';

export function ProductSearch() {
  return (
    <div className="relative w-full group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
      <input
        type="text"
        placeholder="Search menu or SKU..."
        className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-50 focus:border-teal-400 transition-all shadow-sm"
      />
    </div>
  );
}
