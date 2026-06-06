'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginPin } from '@/lib/api';
import { Delete, Key, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const router = useRouter();

  // Dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 relative font-sans selection:bg-teal-100">
      
      {/* Decorative Abstract Background Elements (Lightweight but professional) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/5 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-orange-400/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[380px] bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/50 p-6 sm:p-8 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="mb-4 transform hover:scale-105 transition-transform duration-500 cursor-default">
            <Logo width={56} height={56} showText={false} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1 w-full">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{greeting}!</h1>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium text-xs px-2">Enter your secure PIN to access POS</p>
        </div>

        {/* Interactive PIN Indicators */}
        <div className="flex justify-center mb-6 h-5 items-center">
          <div className={`flex gap-3 ${error ? 'animate-shake' : ''}`}>
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  i < pin.length 
                    ? 'bg-teal-600 scale-110 shadow-md shadow-teal-600/30' 
                    : 'bg-slate-100 border-[1.5px] border-slate-200'
                } ${error ? 'bg-red-500 border-red-500 shadow-md shadow-red-500/30' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Animated Modern Numpad */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[260px] mx-auto mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num.toString())}
              disabled={loading}
              className="group relative h-14 rounded-2xl bg-slate-50 border border-slate-100/50 text-slate-700 text-xl font-semibold overflow-hidden transition-all duration-200 hover:bg-white hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none active:bg-slate-100 outline-none"
            >
              <span className="relative z-10">{num}</span>
              <div className="absolute inset-0 bg-teal-50/50 opacity-0 group-active:opacity-100 transition-opacity" />
            </button>
          ))}
          <div />
          <button
            onClick={() => handleNumber('0')}
            disabled={loading}
            className="group relative h-14 rounded-2xl bg-slate-50 border border-slate-100/50 text-slate-700 text-xl font-semibold overflow-hidden transition-all duration-200 hover:bg-white hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none active:bg-slate-100 outline-none"
          >
             <span className="relative z-10">0</span>
             <div className="absolute inset-0 bg-teal-50/50 opacity-0 group-active:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="h-14 rounded-2xl bg-transparent text-slate-400 transition-all duration-200 hover:text-red-500 hover:bg-red-50 hover:-translate-y-0.5 active:translate-y-1 flex items-center justify-center outline-none disabled:opacity-30 disabled:hover:-translate-y-0 disabled:active:translate-y-0"
          >
            <Delete size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Minimal Footer (Moved INSIDE the card) */}
        <div className="mt-5 pt-4 border-t border-slate-100/50 flex flex-col items-center justify-center text-center gap-3">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 flex items-center gap-2">
            DEMO PIN 
            <span className="text-slate-700 bg-slate-50 shadow-sm px-2 py-0.5 rounded border border-slate-200 font-bold">1234</span>
          </div>
          <button 
            onClick={() => router.push('/auth/login')}
            className="flex items-center gap-1.5 text-[11px] font-bold text-teal-600/80 hover:text-teal-600 transition-colors uppercase tracking-widest"
          >
            <Key size={12} /> Login Admin
          </button>
        </div>

      </div>

    </div>
  );
}
