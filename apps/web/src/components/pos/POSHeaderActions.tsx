'use client';

import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function POSHeaderActions({ onShowCloseShift }: { onShowCloseShift?: () => void }) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="flex items-center gap-3">
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
