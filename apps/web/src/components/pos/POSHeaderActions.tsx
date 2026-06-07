'use client';

import React, { useState, useEffect } from 'react';
import { Settings, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function POSHeaderActions({ onShowCloseShift }: { onShowCloseShift?: () => void }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Network Status Indicator */}
      <div className={`flex items-center gap-2 px-3 h-10 rounded-xl text-sm font-bold border transition-colors ${
        isOnline 
          ? 'bg-teal-50/50 text-teal-600 border-teal-100/50' 
          : 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse shadow-sm shadow-rose-500/10'
      }`}>
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
      </div>

      <button 
        onClick={() => router.push('/settings')}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
        title="Settings"
      >
        <Settings size={20} />
      </button>
      {onShowCloseShift && (
        <button 
          onClick={onShowCloseShift}
          className="px-4 h-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 transition-colors"
          title="Tutup Shift"
        >
          Tutup Shift
        </button>
      )}
      <button 
        onClick={() => logout()}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}
