'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loginPin } from '@/lib/api';
import { Delete } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
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

  const letters: Record<string, string> = {
    '1': '',
    '2': 'ABC',
    '3': 'DEF',
    '4': 'GHI',
    '5': 'JKL',
    '6': 'MNO',
    '7': 'PQRS',
    '8': 'TUV',
    '9': 'WXYZ',
    '0': ''
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* Mobile-like Container */}
      <div className="bg-white w-full max-w-[440px] rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col relative border border-slate-200">
        
        {/* Status Bar */}
        <div className="px-6 pt-5 pb-2 flex justify-between items-center text-xs font-bold text-slate-800">
          <span>{currentTime || '10:45'}</span>
        </div>

        {/* Top Header */}
        <div className="px-6 flex justify-between items-center mt-2">
          <div className="flex items-center gap-2.5">
            <Image 
              src="/transaksi-kita-logo.png" 
              alt="Transaksi Kita Logo" 
              width={28} 
              height={28} 
              className="object-contain"
            />
            <span className="font-bold text-[15px] text-slate-800">Transaksi Kita</span>
          </div>
          <div className="bg-[#e6f4ea] text-[#165a41] px-3 py-1 rounded-full text-xs font-bold border border-[#cce8d5]">
            Shift Pagi
          </div>
        </div>

        {/* PIN Entry Area */}
        <div className="flex flex-col items-center mt-24 px-6">
          <div className="text-[11px] font-bold tracking-widest text-slate-400 mb-5">
            MASUKKAN PIN
          </div>
          
          {/* PIN Dots */}
          <div className={`flex gap-5 mb-10 ${error ? 'animate-shake' : ''}`}>
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded-full border-[2px] transition-all duration-200 ${
                  i < pin.length 
                    ? 'bg-slate-300 border-slate-300' 
                    : 'bg-transparent border-slate-200'
                } ${error ? 'border-red-500 bg-red-500' : ''}`}
              />
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumber(num.toString())}
                disabled={loading}
                className="h-[68px] rounded-2xl bg-[#f8fafc] border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-100 active:bg-slate-200 transition-colors outline-none"
              >
                <span className="text-xl font-semibold text-slate-800 leading-none">{num}</span>
                {letters[num] && (
                  <span className="text-[9px] font-bold text-slate-400 mt-1 tracking-[0.15em]">{letters[num]}</span>
                )}
              </button>
            ))}
            
            {/* Blank Button */}
            <div className="h-[68px] rounded-2xl bg-[#f8fafc] border border-slate-100"></div>

            {/* Zero Button */}
            <button
              onClick={() => handleNumber('0')}
              disabled={loading}
              className="h-[68px] rounded-2xl bg-[#f8fafc] border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-100 active:bg-slate-200 transition-colors outline-none"
            >
              <span className="text-xl font-semibold text-slate-800">0</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="h-[68px] rounded-2xl bg-[#fff5f5] border border-[#fed7d7] flex items-center justify-center hover:bg-[#ffebeb] active:bg-[#fed7d7] transition-colors outline-none disabled:opacity-50 text-[#f56565]"
            >
               <Delete size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="px-6 pb-6 mt-12 w-full">
          <Link
            href="/auth/login"
            className="w-full h-14 rounded-xl bg-[#165a41] text-white flex items-center justify-center font-bold text-[15px] hover:bg-[#114a35] transition-colors shadow-sm"
          >
            Masuk sebagai Admin
          </Link>

          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="px-3 text-[11px] font-medium text-slate-400">atau</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <button className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
            Lupa PIN? Hubungi supervisor
          </button>
          
          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Demo PIN</span>
            <span className="tracking-[0.2em] text-slate-800">1 2 3 4</span>
          </div>
        </div>

      </div>
    </div>
  );
}
