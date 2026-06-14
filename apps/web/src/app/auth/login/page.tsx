'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { API_URL } from '@/lib/api';
import { ArrowLeft, Loader2, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok && data?.data?.accessToken) {
        document.cookie = `token=${data.data.accessToken}; path=/; max-age=86400`;
        router.push('/dashboard');
      } else {
        throw new Error(data.error || 'Email atau password salah');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal untuk login. Silakan periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative font-sans selection:bg-teal-100">
      {/* Left Panel - Brand & Graphic (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract Background for Left Panel */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-900/90 via-slate-900/95 to-slate-900"></div>
          {/* Glowing orbs */}
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-teal-500/20 blur-[120px]" />
          <div className="absolute bottom-[0%] -right-[10%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10">
          <Logo width={64} height={64} showText={false} className="brightness-0 invert mb-8" />
        </div>

        <div className="relative z-10 mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Kelola Bisnis Anda <br/> Lebih Cerdas & Cepat.
          </h2>
          <div className="space-y-4 text-teal-50">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-teal-400" size={24} />
              <p className="text-lg">Analisis penjualan real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-teal-400" size={24} />
              <p className="text-lg">Manajemen inventaris terpusat</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-teal-400" size={24} />
              <p className="text-lg">Sistem POS yang efisien</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Transaksi Kita. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link 
          href="/login"
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="hidden sm:inline">Kembali ke POS</span>
        </Link>

        <div className="w-full max-w-[440px] space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Logo width={64} height={64} showText={false} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Selamat Datang Kembali</h1>
            <p className="text-slate-500 font-medium">Masuk ke akun admin untuk mengelola sistem.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-red-600 mt-1.5" /></div>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700" htmlFor="email">Alamat Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                    <Mail size={20} strokeWidth={2} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 shadow-sm"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700" htmlFor="password">Password</label>
                  <a href="#" className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:underline">Lupa password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                    <Lock size={20} strokeWidth={2} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 transition-all duration-200 shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>
          
          <div className="text-center lg:text-left text-sm font-medium pt-4">
            <span className="text-slate-500">Belum memiliki akun? </span>
            <Link href="/auth/register" className="text-teal-600 font-bold hover:text-teal-700 hover:underline underline-offset-4 transition-all">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
