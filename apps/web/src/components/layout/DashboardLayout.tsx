'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Settings, CreditCard, ClipboardList, Users, FileText, BarChart3 } from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'POS', href: '/pos', icon: <ShoppingCart size={20} />, roles: ['admin', 'supervisor', 'cashier'] },
  { name: 'Produk', href: '/products', icon: <Package size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'Inventori', href: '/inventory', icon: <ClipboardList size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'Pelanggan', href: '/customers', icon: <Users size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'Transaksi', href: '/transactions', icon: <FileText size={20} />, roles: ['admin', 'supervisor', 'cashier'] },
  { name: 'Laporan', href: '/reports', icon: <BarChart3 size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'Pengaturan', href: '/settings', icon: <Settings size={20} />, roles: ['admin'] },
];

import { Logo } from '@/components/ui/Logo';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  const userRole = user?.role || 'cashier';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex z-10 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <Logo width={28} height={28} />
            <span className="font-bold text-lg tracking-tight text-[#0B5A63]">TRANSAKSI KITA</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 flex flex-col gap-1">
          {MENU_ITEMS.filter(item => item.roles.includes(userRole)).map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-teal-50/80 text-[#0B5A63]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              <LogOut size={20} />
            </div>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 md:hidden">
          <div className="flex items-center gap-2">
            <Logo width={28} height={28} />
            <span className="font-bold text-lg text-[#0B5A63]">TRANSAKSI KITA</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
