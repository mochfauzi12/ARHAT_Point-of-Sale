'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginPin } from '@/lib/api';
import { Delete, Fingerprint, UserCircle2, ShoppingCart, TrendingUp } from 'lucide-react';

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
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#165a55] to-[#0d3b38]"></div>
        {/* Soft highlight */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Main Card */}
        <div className="bg-white/20 backdrop-blur-xl rounded-[2.5rem] p-8 pt-10 pb-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-white/30 flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Top Demo PIN Badge */}
          <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-medium text-slate-800 border border-white/30 flex items-center gap-1.5 shadow-sm z-20">
            Demo PIN <span className="text-slate-500">|</span> <span className="font-bold text-white">1234</span>
          </div>
          
          {/* Top subtle clear glass overlay effect for the header area */}
          <div className="absolute top-0 left-0 w-full h-[120px] bg-white/10 border-b border-white/20 z-0"></div>

          {/* 3D-like Icon Area */}
          <div className="relative w-20 h-20 mb-3 mt-4 flex items-center justify-center z-10">
             <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
             <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative">
                  <ShoppingCart className="w-10 h-10 text-slate-700 drop-shadow-md" strokeWidth={1.5} />
                  <TrendingUp className="w-6 h-6 text-teal-500 absolute -top-3 -right-3 drop-shadow-md" strokeWidth={2.5} />
                </div>
             </div>
          </div>

          <h1 className="text-2xl font-medium text-slate-800 tracking-tight z-10">{greeting}</h1>
          
          <p className="text-slate-700/80 font-medium text-[13px] mt-2 flex items-center gap-1.5 z-10">
            <UserCircle2 size={16} className="text-slate-600" /> Enter your secure PIN to access POS.
          </p>

          {/* PIN Indicators */}
          <div className={`mt-8 mb-8 flex justify-center bg-black/5 px-6 py-3 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border border-white/20 z-10 ${error ? 'animate-shake' : ''}`}>
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    i < pin.length 
                      ? 'bg-slate-600 scale-110 shadow-[0_2px_4px_rgba(0,0,0,0.3)]' 
                      : 'bg-black/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]'
                  } ${error ? 'bg-red-500 shadow-[0_2px_4px_rgba(239,68,68,0.4)]' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[260px] mx-auto z-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumber(num.toString())}
                disabled={loading}
                className="h-[64px] sm:h-[68px] rounded-[1.25rem] bg-white/50 backdrop-blur-md border border-white/80 text-slate-800 text-[22px] font-medium shadow-[0_4px_10px_rgba(0,0,0,0.04),inset_0_2px_0_rgba(255,255,255,1)] flex items-center justify-center hover:bg-white/60 transition-all active:scale-95 active:shadow-inner outline-none"
              >
                <span>{num}</span>
              </button>
            ))}
            
            {/* Fingerprint Button */}
            <button
              disabled={loading}
              className="h-[64px] sm:h-[68px] rounded-[1.25rem] bg-transparent border border-transparent text-slate-700 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 outline-none"
            >
              <Fingerprint size={28} strokeWidth={1.5} />
            </button>

            {/* Zero Button */}
            <button
              onClick={() => handleNumber('0')}
              disabled={loading}
              className="h-[64px] sm:h-[68px] rounded-[1.25rem] bg-white/50 backdrop-blur-md border border-white/80 text-slate-800 text-[22px] font-medium shadow-[0_4px_10px_rgba(0,0,0,0.04),inset_0_2px_0_rgba(255,255,255,1)] flex items-center justify-center hover:bg-white/60 transition-all active:scale-95 active:shadow-inner outline-none"
            >
              <span>0</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="h-[64px] sm:h-[68px] rounded-[1.25rem] bg-white/70 backdrop-blur-md border border-white/90 text-[#e87a38] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.04),inset_0_2px_0_rgba(255,255,255,1)] hover:bg-white/80 transition-all active:scale-95 active:shadow-inner outline-none disabled:opacity-50"
            >
              <Delete size={24} strokeWidth={2} />
            </button>
          </div>

          <div className="mt-8 z-10">
             <Link 
               href="#"
               className="text-[13px] text-slate-700/80 font-medium hover:text-slate-900 transition-colors"
             >
               Need help or forgot your PIN?
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
