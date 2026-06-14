'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { API_URL } from '@/lib/api';
import { ArrowLeft, Loader2, Mail, Lock, User, Store, KeyRound } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (step === 'register') {
        const response = await fetch(`${API_URL}/auth/register-tenant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantName, fullName, email, password })
        });
        const data = await response.json();
        
        if (response.ok && data?.requiresOtp) {
          setStep('otp');
        } else if (response.ok && data?.success) {
          // If no OTP required (fallback)
          const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginResponse.json();
          if (loginResponse.ok && loginData?.data?.accessToken) {
            document.cookie = `token=${loginData.data.accessToken}; path=/; max-age=86400`;
            router.push('/dashboard');
          } else {
            router.push('/auth/login?registered=true');
          }
        } else {
          throw new Error(data.error || 'Gagal mendaftarkan toko. Silakan coba lagi.');
        }
      } else {
        const response = await fetch(`${API_URL}/auth/verify-register-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: otp })
        });
        const data = await response.json();
        
        if (response.ok && data?.success) {
          // After verification, try to login automatically
          const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginResponse.json();
          
          if (loginResponse.ok && loginData?.data?.accessToken) {
            document.cookie = `token=${loginData.data.accessToken}; path=/; max-age=86400`;
            router.push('/dashboard');
          } else if (loginData?.requiresOtp) {
             router.push('/auth/login?verified=true');
          } else {
            router.push('/auth/login?registered=true');
          }
        } else {
          throw new Error(data.error || 'Kode OTP tidak valid');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan toko');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-teal-100">
      
      {/* Decorative Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/5 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-orange-400/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/50 p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="mb-4 transform hover:scale-105 transition-transform duration-500 cursor-default">
            <Logo width={64} height={64} showText={false} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
            {step === 'register' ? 'Daftarkan Toko Anda' : 'Verifikasi OTP'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {step === 'register' ? 'Bergabung dan kelola bisnis Anda dengan mudah' : `Masukkan kode OTP 6 angka yang dikirim ke ${email}`}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-500 border border-red-100 animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {step === 'register' ? (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                    <Store size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="tenantName"
                    name="tenantName"
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                    placeholder="Nama Toko / Bisnis (Contoh: Arhat Cafe)"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                    placeholder="Nama Lengkap Pemilik"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                    placeholder="Alamat Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                    placeholder="Password (Min. 6 Karakter)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                  <KeyRound size={18} strokeWidth={2.5} />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 text-center tracking-[0.5em] text-lg"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center items-center gap-2 rounded-2xl bg-[#0B5A63] px-4 py-4 text-sm font-bold text-white hover:bg-[#0E8A94] focus:outline-none focus:ring-4 focus:ring-teal-500/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 transition-all duration-200 shadow-lg shadow-teal-900/20"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Mendaftarkan Toko...</span>
              </>
            ) : (
              <span>{step === 'register' ? 'Daftar Sekarang' : 'Verifikasi Akun'}</span>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm font-medium">
          <span className="text-slate-500">Sudah punya akun toko? </span>
          <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 hover:underline underline-offset-4 transition-all">
            Masuk ke Admin
          </Link>
        </div>

      </div>

    </div>
  );
}
