import React from 'react';
import { ProductSearch } from '@/components/pos/ProductSearch';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartPanel } from '@/components/pos/CartPanel';
import { Store, UserCircle, Settings } from 'lucide-react';

export default function POSPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 flex flex-col">
      <div className="flex-1 w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)]">
        
        {/* Navbar (Top) */}
        <div className="flex-none p-4 sm:p-6 flex items-center justify-between border-b border-gray-100">
          <a href="/dashboard" className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm pl-3 pr-4 py-2 border border-gray-100 hover:bg-white transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white">
              <Store size={18} />
            </div>
            <span className="font-semibold text-black tracking-tight">ARHAT POS</span>
          </a>
          
          <div className="flex-1 max-w-md mx-6">
            <ProductSearch />
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
              <Settings size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
              <UserCircle size={20} />
            </button>
          </div>
        </div>

        {/* Content Layer */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50/50">
          
          {/* Left Side: Product Grid */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
            <div className="mb-6">
              <p className="text-3xl sm:text-4xl font-medium leading-tight text-black drop-shadow-sm">
                Select products <br />
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }} className="text-gray-500">
                  for checkout
                </span>
              </p>
            </div>
            
            <ProductGrid />
          </div>

          {/* Right Side: Cart Panel */}
          <div className="w-full lg:w-[400px] shrink-0 border-l border-gray-100 bg-white">
            <CartPanel />
          </div>
          
        </div>
      </div>
    </div>
  );
}
