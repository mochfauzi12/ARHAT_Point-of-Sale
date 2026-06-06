'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api';
import { Plus, Search, Edit2, Trash2, UsersRound, ShieldAlert } from 'lucide-react';
import { UserModal } from '@/components/users/UserModal';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (error: any) {
        alert(error.message || 'Gagal menghapus karyawan');
      }
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingUser) {
      await updateUser(editingUser.id, data);
    } else {
      await createUser(data);
    }
    setShowModal(false);
    fetchUsers();
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'supervisor': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Admin';
      case 'supervisor': return 'Supervisor';
      case 'cashier': return 'Kasir';
      default: return role;
    }
  };

  if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500 max-w-md">Anda tidak memiliki izin untuk mengakses halaman Manajemen Karyawan. Hanya Admin atau Supervisor yang dapat mengakses fitur ini.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UsersRound className="text-teal-600" />
              Manajemen Karyawan
            </h1>
            <p className="mt-1 text-sm text-gray-500">Kelola akses, role, dan PIN login karyawan Anda.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            {currentUser?.role === 'admin' && (
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
              >
                <Plus size={20} />
                <span>Tambah Karyawan</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Terakhir Login</th>
                  {currentUser?.role === 'admin' && (
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Tidak ada data karyawan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                      </td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('id-ID') : 'Belum pernah'}
                      </td>
                      {currentUser?.role === 'admin' && (
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                            title="Edit Karyawan"
                          >
                            <Edit2 size={18} />
                          </button>
                          {currentUser.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                              title="Hapus Karyawan"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </DashboardLayout>
  );
}
