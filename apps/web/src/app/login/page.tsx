'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginPin } from '@/lib/api';
import { Delete, Key, Sparkles, UserCircle2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const router = useRouter();

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative font-sans selection:bg-teal-100">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[#164f51]"></div>
        {/* Radial gradient to highlight the center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-[100px]"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform transition-all hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
          
          {/* Header Section */}
          <div className="bg-slate-50 p-8 pb-6 border-b border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-5">
              <Logo width={40} height={40} showText={false} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{greeting}</h1>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
              <UserCircle2 size={16} /> Enter PIN to access POS
            </p>
          </div>

          {/* Keypad Section */}
          <div className="p-8">
            {/* PIN Indicators */}
            <div className="flex justify-center mb-8 h-6 items-center">
              <div className={`flex gap-4 ${error ? 'animate-shake' : ''}`}>
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      i < pin.length 
                        ? 'bg-teal-600 scale-110 shadow-[0_0_12px_rgba(13,148,136,0.6)]' 
                        : 'bg-slate-200 border-2 border-slate-300 inset-shadow-sm'
                    } ${error ? 'bg-red-500 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumber(num.toString())}
                  disabled={loading}
                  className="group relative h-16 rounded-full bg-slate-50 border-b-[3px] border-slate-200 text-slate-700 text-2xl font-bold overflow-hidden transition-all duration-150 hover:bg-slate-100 hover:border-slate-300 active:border-b-0 active:translate-y-[3px] active:bg-slate-200 outline-none flex items-center justify-center"
                >
                  <span>{num}</span>
                </button>
              ))}
              <div />
              <button
                onClick={() => handleNumber('0')}
                disabled={loading}
                className="group relative h-16 rounded-full bg-slate-50 border-b-[3px] border-slate-200 text-slate-700 text-2xl font-bold overflow-hidden transition-all duration-150 hover:bg-slate-100 hover:border-slate-300 active:border-b-0 active:translate-y-[3px] active:bg-slate-200 outline-none flex items-center justify-center"
              >
                 <span>0</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                className="h-16 rounded-full bg-transparent text-slate-400 transition-all duration-150 hover:text-red-500 hover:bg-red-50 active:bg-red-100 flex items-center justify-center outline-none disabled:opacity-30"
              >
                <Delete size={28} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info below card */}
        <div className="mt-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur border border-slate-700/50 text-xs font-medium tracking-wider text-slate-300">
            DEMO PIN <span className="text-white bg-slate-700 px-2 py-0.5 rounded font-bold">1234</span>
          </div>
          <Link 
            href="/auth/login"
            className="flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors uppercase tracking-widest"
          >
            <Key size={14} /> Switch to Admin
          </Link>
        </div>

      </div>
    </div>
  );
}
