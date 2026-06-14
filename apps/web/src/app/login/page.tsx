'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loginPin } from '@/lib/api';
import { Delete, LogIn, Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-200">
        
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden md:flex w-1/2 bg-[#165a41] p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#34d399] blur-3xl"></div>
          </div>
          
          <div className="z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Image 
                  src="/transaksi-kita-logo.png" 
                  alt="Transaksi Kita Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">Transaksi Kita</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Sistem Kasir <br /> Modern & Cepat
            </h1>
            <p className="text-teal-100 text-lg max-w-sm leading-relaxed">
              Kelola penjualan, pantau inventaris, dan jalankan bisnis Anda dengan efisien dalam satu platform terpadu.
            </p>
          </div>
          
          <div className="z-10 flex items-center justify-between text-teal-200 text-sm font-medium">
            <span>© 2024 Transaksi Kita.</span>
            <span>{currentTime || '12:00'}</span>
          </div>
        </div>

        {/* Right Side - PIN Entry */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          <div className="max-w-[340px] mx-auto w-full">
            
            {/* Mobile Logo (Visible only on small screens) */}
            <div className="flex md:hidden items-center justify-center gap-3 mb-10">
              <div className="bg-slate-50 p-2 rounded-xl shadow-sm border border-slate-100">
                <Image 
                  src="/transaksi-kita-logo.png" 
                  alt="Logo" 
                  width={32} 
                  height={32} 
                />
              </div>
              <span className="text-2xl font-bold text-slate-800">Transaksi Kita</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang</h2>
              <p className="text-slate-500 text-sm">Masukkan 4 digit PIN Kasir Anda</p>
            </div>

            {/* Error & Loading State */}
            <div className="h-6 flex items-center justify-center mb-4">
              {loading && <Loader2 className="animate-spin text-teal-600" size={20} />}
              {error && <span className="text-red-500 text-sm font-medium animate-pulse">PIN yang dimasukkan salah</span>}
            </div>

            {/* PIN Dots */}
            <div className={`flex justify-center gap-5 mb-10 ${error ? 'animate-shake' : ''}`}>
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < pin.length 
                      ? 'bg-[#165a41] scale-110 shadow-md' 
                      : 'bg-slate-200'
                  } ${error ? 'bg-red-500' : ''}`}
                />
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumber(num.toString())}
                  disabled={loading}
                  className="h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl font-semibold text-slate-700 hover:bg-[#e6f4ea] hover:text-[#165a41] hover:border-[#cce8d5] active:scale-95 transition-all duration-200"
                >
                  {num}
                </button>
              ))}
              <div className="h-16"></div> {/* Empty space */}
              <button
                onClick={() => handleNumber('0')}
                disabled={loading}
                className="h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl font-semibold text-slate-700 hover:bg-[#e6f4ea] hover:text-[#165a41] hover:border-[#cce8d5] active:scale-95 transition-all duration-200"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                className="h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 disabled:hover:border-slate-100 disabled:active:scale-100"
              >
                <Delete size={24} />
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="px-4 text-[11px] font-medium text-slate-400 uppercase tracking-wider">atau</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4">
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 h-14 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <LogIn size={18} />
                <span className="text-[15px]">Masuk sebagai Admin</span>
              </Link>
              
              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">
                  Demo PIN: <strong className="text-slate-600 tracking-wider">1234</strong>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
