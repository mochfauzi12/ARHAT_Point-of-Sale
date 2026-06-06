'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-sm text-gray-500 mt-1">Atur konfigurasi toko, struk, dan preferensi aplikasi Anda.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
            <Settings size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Modul Pengaturan Segera Hadir</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Kami sedang menyiapkan halaman pengaturan untuk menyesuaikan toko Anda.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
