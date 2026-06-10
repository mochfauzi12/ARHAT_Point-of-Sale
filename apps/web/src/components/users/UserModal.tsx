import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';

interface UserModalProps {
  user?: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function UserModal({ user, onClose, onSubmit }: UserModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'cashier',
    password: '',
    pin: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || 'cashier',
        password: '', // Don't show password
        pin: user.pin || '', // We don't usually send pin back for security, but just in case
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName) return setError('Nama harus diisi');
    if (!user && !formData.email) return setError('Email harus diisi');
    if (!user && !formData.password) return setError('Password harus diisi');
    if (formData.pin && !/^\d{4}$/.test(formData.pin)) return setError('PIN harus 4 angka');

    try {
      setLoading(true);
      const submitData = { ...formData };
      if (!submitData.password) delete (submitData as any).password;
      if (!submitData.pin) delete (submitData as any).pin;
      
      await onSubmit(submitData);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {user ? 'Edit Karyawan' : 'Tambah Karyawan'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled={!!user}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl outline-none transition-all ${
                user ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent'
              }`}
              placeholder="budi@example.com"
            />
            {user && <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peran (Role)</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            >
              <option value="cashier">Kasir (Hanya akses POS)</option>
              <option value="supervisor">Supervisor (Akses POS & Produk)</option>
              <option value="admin">Admin (Akses Penuh)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {user ? 'Password Baru (Opsional)' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all pr-10"
                placeholder={user ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Login POS {user ? '(Opsional)' : '(Opsional)'}
            </label>
            <input
              type="text"
              maxLength={4}
              value={formData.pin}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, pin: val });
              }}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-mono tracking-widest"
              placeholder="Contoh: 1234"
            />
            <p className="text-xs text-gray-500 mt-1">4 Angka untuk quick-login di layar kasir.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
