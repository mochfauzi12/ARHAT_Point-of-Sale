'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginPin } from '@/lib/api';
import { Eye, EyeOff, Loader2, Delete } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNumber = async (num: string) => {
    if (loading) return;
    setError(false);
    
    const newPin = pin + num;
    setPin(newPin);
    
    if (newPin.length === 4) {
      // Auto-submit when 4 digits reached
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo width={64} height={64} showText={true} />
          <p className="text-gray-500 mt-4">Enter your PIN to access the system</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          {/* PIN Display */}
          <div className={`flex justify-center gap-4 mb-8 ${error ? 'animate-shake' : ''}`}>
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full transition-colors ${
                  i < pin.length ? 'bg-black' : 'bg-gray-200'
                } ${error ? 'bg-red-500' : ''}`}
              />
            ))}
          </div>
          
          {error && (
            <p className="text-center text-red-500 text-sm mb-4">Invalid PIN code</p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumber(num.toString())}
                disabled={loading}
                className="h-16 rounded-2xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-2xl font-semibold transition-colors disabled:opacity-50"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleNumber('0')}
              disabled={loading}
              className="h-16 rounded-2xl bg-gray-50 hover:bg-teal-50 active:bg-teal-100 text-2xl font-semibold transition-colors disabled:opacity-50"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="h-16 rounded-2xl bg-gray-50 hover:bg-red-50 active:bg-red-100 text-gray-500 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Delete size={24} />
            </button>
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-8">
          Tip: Use PIN 1234 for Cashier
        </p>
        
        <div className="text-center mt-6">
          <button 
            onClick={() => router.push('/auth/login')}
            className="text-[#0B5A63] hover:text-[#0E8A94] text-sm font-medium transition-colors"
          >
            Login dengan Email (Admin / Supervisor)
          </button>
        </div>
      </div>
    </div>
  );
}
