'use client';
import React, { useEffect, useState } from 'react';
import { getCurrentShift, openShift, closeShift } from '@/lib/api';
import { ShiftModal } from '@/components/pos/ShiftModal';
import { ProductSearch } from '@/components/pos/ProductSearch';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Logo } from '@/components/ui/Logo';
import { CartPanel } from '@/components/pos/CartPanel';
import { Store, UserCircle, Settings } from 'lucide-react';
import { POSHeaderActions } from '@/components/pos/POSHeaderActions';

export default function POSPage() {
  const [shift, setShift] = useState<any>(null);
  const [loadingShift, setLoadingShift] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);

  useEffect(() => {
    checkShift();
  }, []);

  const checkShift = async () => {
    try {
      const activeShift = await getCurrentShift();
      setShift(activeShift);
    } catch (e) {
      console.error('Failed to load shift', e);
    } finally {
      setLoadingShift(false);
    }
  };

  const handleOpenShift = async (amount: number) => {
    setIsSubmitting(true);
    try {
      const newShift = await openShift(amount);
      setShift(newShift);
    } catch (e: any) {
      alert(e.message || 'Gagal membuka shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseShift = async (amount: number, notes?: string) => {
    setIsSubmitting(true);
    try {
      await closeShift(amount, notes);
      setShift(null); // Return to open shift screen
      setShowCloseShift(false);
    } catch (e: any) {
      alert(e.message || 'Gagal menutup shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingShift) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 font-medium">Memeriksa Shift Kasir...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 sm:p-4 lg:p-6 flex flex-col relative overflow-hidden">
      {!shift && !showCloseShift && (
        <ShiftModal type="open" onSubmit={handleOpenShift} isSubmitting={isSubmitting} />
      )}
      
      {showCloseShift && shift && (
        <ShiftModal type="close" shiftData={shift} onSubmit={handleCloseShift} isSubmitting={isSubmitting} />
      )}
      
      <div className={`flex-1 w-full bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/50 overflow-hidden flex flex-col h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)] lg:h-[calc(100vh-48px)] transition-all duration-500 ${(!shift || showCloseShift) ? 'opacity-50 pointer-events-none scale-[0.98]' : 'scale-100'}`}>
        
        {/* Navbar (Top) */}
        <div className="flex-none px-6 py-4 flex items-center justify-between border-b border-slate-100/60 bg-white/80 backdrop-blur-md z-20">
          <a href="/dashboard" className="flex items-center gap-3 px-2 transition-transform hover:scale-105 active:scale-95 group">
            <div className="p-2 bg-teal-50 rounded-xl group-hover:bg-teal-100 transition-colors">
              <Logo width={24} height={24} />
            </div>
            <span className="font-extrabold text-lg text-slate-800 tracking-tight">Transaksi <span className="text-teal-600">Kita</span></span>
          </a>
          
          <div className="flex-1 max-w-xl mx-8">
            <ProductSearch />
          </div>

          <POSHeaderActions onShowCloseShift={() => setShowCloseShift(true)} />
        </div>

        {/* Content Layer */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50/30">
          
          {/* Left Side: Product Grid */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth hide-scrollbar">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                    Discovery
                  </h1>
                  <p className="text-slate-500 font-medium text-sm">
                    Find and tap products to add them to cart.
                  </p>
                </div>
              </div>
              
              <ProductGrid />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
          </div>

          {/* Right Side: Cart Panel */}
          <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white/60 backdrop-blur-xl border-l border-slate-100 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-20">
            <CartPanel />
          </div>
          
        </div>
      </div>
      
      {/* Global CSS to hide scrollbar for sleek look */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
