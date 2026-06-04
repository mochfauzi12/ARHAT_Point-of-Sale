'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (!success) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ARHAT POS</h1>
          <p className="text-gray-500 text-sm mt-2">Enter manager password to access dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-black'} focus:outline-none transition-colors bg-gray-50 focus:bg-white`}
            />
            {error && <p className="text-red-500 text-xs mt-2 font-medium">Incorrect password. Hint: admin123</p>}
          </div>
          <button 
            type="submit"
            className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
