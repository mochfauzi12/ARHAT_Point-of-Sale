'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Settings, ClipboardList, Users, FileText, BarChart3, UsersRound, Menu, X } from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'POS', href: '/pos', icon: <ShoppingCart size={20} />, roles: ['admin', 'supervisor', 'cashier'] },
  { name: 'Produk', href: '/products', icon: <Package size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'Inventori', href: '/inventory', icon: <ClipboardList size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'Pelanggan', href: '/customers', icon: <Users size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'Karyawan', href: '/users', icon: <UsersRound size={20} />, roles: ['admin'] },
  { name: 'Transaksi', href: '/transactions', icon: <FileText size={20} />, roles: ['admin', 'supervisor', 'cashier'] },
  { name: 'Laporan', href: '/reports', icon: <BarChart3 size={20} />, roles: ['admin', 'supervisor'] },
  { name: 'Pengaturan', href: '/settings', icon: <Settings size={20} />, roles: ['admin'] },
];

import { Logo } from '@/components/ui/Logo';
import { SyncManager } from '@/components/SyncManager';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const userRole = user?.role || 'cashier';
  const filteredMenuItems = MENU_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/60 flex-col hidden md:flex z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <Logo width={28} height={28} />
            <span className="font-bold text-lg tracking-tight text-[#0B5A63]">TRANSAKSI KITA</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${
                  isActive 
                    ? 'bg-[#0B5A63]/10 text-[#0B5A63] shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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

        <div className="p-4 border-t border-slate-100 shrink-0">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#0B5A63] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{user.fullName}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              <LogOut size={20} />
            </div>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <Logo width={28} height={28} />
            <span className="font-bold text-lg tracking-tight text-[#0B5A63]">TRANSAKSI KITA</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-4 flex flex-col gap-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#0B5A63]/10 text-[#0B5A63] shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#0B5A63] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{user.fullName}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 md:hidden sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <Logo width={24} height={24} />
              <span className="font-bold text-base text-[#0B5A63]">TRANSAKSI KITA</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <SyncManager />
    </div>
  );
}
