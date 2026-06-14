'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginPin } from '@/lib/api';
import { Delete, Fingerprint, UserCircle2, ShoppingCart, TrendingUp, Key } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const router = useRouter();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning!');
    else if (hour < 18) setGreeting('Good Afternoon!');
    else setGreeting('Good Evening!');
  }, []);

  const handleNumber = async (num: string) => {
    if (loading) return;
    setError(false);
    
    const newPin = pin + num;
    setPin(newPin);
    
    if (newPin.length === 4) {
      setLoading(true);
      try {
        await loginPin(newPin);
        router.push('/dashboard');
      } catch (err) {
        setError(true);
        setPin('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="min-h-screen bg-[#114b48] flex items-center justify-center p-4 relative font-sans selection:bg-teal-100">
      
      {/* Background gradients for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#165a55] to-[#0a2e2c]"></div>
        {/* Soft radial highlight */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-300/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[360px]">
        {/* Main Card (Clear Glass Wrapper) */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.4)] border border-white/20 flex flex-col overflow-hidden relative">
          
          {/* Top Header Area (Clear Glass) */}
          <div className="p-6 pb-4 flex flex-col items-center relative min-h-[110px]">
            {/* Top Demo PIN Badge */}
            <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-medium text-white/80 border border-white/20 flex items-center gap-1.5 shadow-sm">
              Demo PIN <span className="text-white/40">|</span> <span className="font-bold text-white">1234</span>
            </div>

            {/* 3D-like Icon Area */}
            <div className="relative w-16 h-16 mt-2 flex items-center justify-center">
               <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
               <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="relative">
                    <ShoppingCart className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={1.5} />
                    <TrendingUp className="w-6 h-6 text-teal-300 absolute -top-2 -right-3 drop-shadow-md" strokeWidth={2.5} />
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom Body Area (Milky Inset Card) */}
          <div className="bg-white/60 backdrop-blur-2xl flex-1 rounded-t-[2rem] border-t border-white/70 p-8 pt-6 flex flex-col items-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)] relative z-10">
            
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">{greeting}</h1>
            
            <p className="text-slate-600 font-medium text-[12px] sm:text-[13px] mt-1.5 flex items-center gap-1.5">
              <UserCircle2 size={14} className="text-slate-500" /> Enter your secure PIN to access POS.
            </p>

            {/* PIN Indicators */}
            <div className={`mt-6 mb-6 flex justify-center bg-black/5 px-6 py-3 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-white/40 ${error ? 'animate-shake' : ''}`}>
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i < pin.length 
                        ? 'bg-slate-700 scale-110 shadow-[0_2px_4px_rgba(0,0,0,0.2)]' 
                        : 'bg-black/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]'
                    } ${error ? 'bg-red-500 shadow-[0_2px_4px_rgba(239,68,68,0.4)]' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumber(num.toString())}
                  disabled={loading}
                  className="h-[60px] sm:h-[64px] rounded-[1rem] bg-white/90 backdrop-blur-md border border-white text-slate-800 text-[20px] font-medium shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1)] flex items-center justify-center hover:bg-white hover:scale-105 transition-all active:scale-95 active:shadow-inner outline-none"
                >
                  <span>{num}</span>
                </button>
              ))}
              
              {/* Fingerprint Button */}
              <button
                disabled={loading}
                className="h-[60px] sm:h-[64px] rounded-[1rem] bg-transparent border border-transparent text-slate-500 flex items-center justify-center hover:bg-white/40 transition-all active:scale-95 outline-none"
              >
                <Fingerprint size={26} strokeWidth={1.5} />
              </button>

              {/* Zero Button */}
              <button
                onClick={() => handleNumber('0')}
                disabled={loading}
                className="h-[60px] sm:h-[64px] rounded-[1rem] bg-white/90 backdrop-blur-md border border-white text-slate-800 text-[20px] font-medium shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1)] flex items-center justify-center hover:bg-white hover:scale-105 transition-all active:scale-95 active:shadow-inner outline-none"
              >
                <span>0</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                className="h-[60px] sm:h-[64px] rounded-[1rem] bg-white/90 backdrop-blur-md border border-white text-[#e87a38] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1)] hover:bg-white hover:scale-105 transition-all active:scale-95 active:shadow-inner outline-none disabled:opacity-50"
              >
                <Delete size={22} strokeWidth={2} />
              </button>
            </div>

            <div className="mt-8 mb-2 w-full max-w-[240px] flex flex-col gap-3">
              <Link
                href="/auth/login"
                className="w-full h-12 rounded-[1rem] bg-teal-600/10 border border-teal-600/20 text-teal-800 flex items-center justify-center gap-2 font-semibold text-[14px] hover:bg-teal-600/20 transition-all active:scale-95 shadow-sm"
              >
                <UserCircle2 size={18} /> Login as Admin
              </Link>
              
              <Link 
                href="#"
                className="text-[12px] text-slate-500 font-medium hover:text-slate-800 transition-colors text-center"
              >
                Need help or forgot your PIN?
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
