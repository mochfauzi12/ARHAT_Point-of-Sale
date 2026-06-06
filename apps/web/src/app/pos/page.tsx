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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 flex flex-col relative">
      {!shift && !showCloseShift && (
        <ShiftModal type="open" onSubmit={handleOpenShift} isSubmitting={isSubmitting} />
      )}
      
      {showCloseShift && shift && (
        <ShiftModal type="close" shiftData={shift} onSubmit={handleCloseShift} isSubmitting={isSubmitting} />
      )}
      
      <div className={`flex-1 w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] ${(!shift || showCloseShift) ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Navbar (Top) */}
        <div className="flex-none p-4 sm:p-6 flex items-center justify-between border-b border-gray-100">
          <a href="/dashboard" className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl transition-colors hover:bg-gray-100">
            <Logo width={28} height={28} />
            <span className="font-bold text-[#0B5A63] tracking-tight">TRANSAKSI KITA</span>
          </a>
          
          <div className="flex-1 max-w-md mx-6">
            <ProductSearch />
          </div>

          <POSHeaderActions onShowCloseShift={() => setShowCloseShift(true)} />
        </div>

        {/* Content Layer */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50/50">
          
          {/* Left Side: Product Grid */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
            <div className="mb-6 flex flex-col gap-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Menu
              </h1>
              <p className="text-gray-500 font-medium">
                Select products to add to cart
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
