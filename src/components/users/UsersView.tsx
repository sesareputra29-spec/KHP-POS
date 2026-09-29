import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users2, 
  Plus, 
  ShieldCheck, 
  KeyRound, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  UserCheck 
} from 'lucide-react';
import { User, UserRole, Permission } from '../../types';

export const UsersView: React.FC = () => {
  const { 
    users, 
    currentUser, 
    addUser, 
    updateUser, 
    deleteUser, 
    switchUser 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('1111');
  const [role, setRole] = useState<UserRole>('cashier');
  const [phone, setPhone] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(['pos', 'reports']);
  const [active, setActive] = useState(true);

  const ALL_PERMISSIONS: { key: Permission; label: string; desc: string }[] = [
    { key: 'pos', label: 'Kasir POS & Transaksi', desc: 'Buka transaksi, scan barcode, keranjang, dan bayar' },
    { key: 'hpp_calculator', label: 'Kalkulator HPP & Resep', desc: 'Hitung BOM resep, direct labor, overhead & target margin' },
    { key: 'stock', label: 'Bahan Baku & Inventaris', desc: 'Kelola stok bahan, restock PO, dan stok opname' },
    { key: 'products', label: 'Katalog Menu Produk', desc: 'Tambah, edit harga, dan hapus menu' },
    { key: 'reports', label: 'Laporan Keuangan', desc: 'Akses laporan laba rugi, mutasi kas, dan penjualan' },
    { key: 'users', label: 'Kelola Multi-User & Hak Akses', desc: 'Atur staff, ganti PIN, dan ubah izin akses' },
    { key: 'settings', label: 'Pengaturan & Backup Data', desc: 'Konfigurasi nama toko, pajak, printer, dan reset data' },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    switch (newRole) {
      case 'admin':
        setPermissions(['pos', 'hpp_calculator', 'products', 'ingredients', 'stock', 'purchases', 'reports', 'users', 'settings']);
        break;
      case 'manager':
        setPermissions(['pos', 'hpp_calculator', 'products', 'ingredients', 'stock', 'purchases', 'reports']);
        break;
      case 'cashier':
        setPermissions(['pos', 'reports']);
        break;
      case 'kitchen':
        setPermissions(['hpp_calculator', 'ingredients', 'stock']);
        break;
    }
  };

  const handleTogglePermission = (perm: Permission) => {
    setPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPin(Math.floor(1000 + Math.random() * 9000).toString());
    setRole('cashier');
    setPhone('');
    setPermissions(['pos', 'reports']);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username);
    setPin(u.pin);
    setRole(u.role);
    setPhone(u.phone || '');
    setPermissions(u.permissions);
    setActive(u.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        name,
        username: username || name.toLowerCase().replace(/\s+/g, ''),
        pin,
        role,
        phone,
        permissions,
        active,
      });
    } else {
      addUser({
        name,
        username: username || name.toLowerCase().replace(/\s+/g, ''),
        pin,
        role,
        phone,
        permissions,
        active,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Users2 className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Multi-User & Hak Akses (RBAC)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola staff, kasir, manager, PIN akses cepat, dan matriks wewenang fitur yang dapat disesuaikan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Staff Baru</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="mt-4 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Role Jabatan</th>
                <th className="py-3 px-4">PIN Akses</th>
                <th className="py-3 px-4">Hak Akses Aktif</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map(u => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 font-bold text-neutral-800 flex items-center justify-center text-xs uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-sm bg-neutral-900 text-white text-[9px] font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">@{u.username} · {u.phone || 'No Telp -'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold capitalize ${
                        u.role === 'admin' 
                          ? 'bg-neutral-900 text-white' 
                          : u.role === 'manager' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : u.role === 'cashier' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.role === 'admin' ? 'Owner / Admin' : u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-neutral-800 tabular-nums">
                      <span className="px-2 py-0.5 bg-neutral-100 rounded-md border border-neutral-200">
                        {u.pin}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {u.role === 'admin' ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">
                            Akses Penuh Semua Modul
                          </span>
                        ) : (
                          u.permissions.map(p => (
                            <span key={p} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded-sm text-[10px]">
                              {p}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {u.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {!isCurrent && (
                          <button
                            onClick={() => switchUser(u.pin)}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[11px] font-semibold transition-colors"
                            title="Ganti ke Akun Ini"
                          >
                            Masuk
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {users.length > 1 && !isCurrent && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus pengguna "${u.name}"?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-neutral-200 relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">
                {editingUser ? 'Edit Data Staff' : 'Tambah Staff Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Nama Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Username:</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rian"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Role Utama:</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                  >
                    <option value="admin">Owner / Super Admin (Akses Penuh)</option>
                    <option value="manager">Manager Operasional</option>
                    <option value="cashier">Kasir (Cashier)</option>
                    <option value="kitchen">Staff Kitchen / Gudang</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">PIN 4-Digit Login:</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1111"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono font-bold tracking-widest text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">No. WhatsApp / HP:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                />
              </div>

              {/* Granular Permissions Checklist */}
              {role !== 'admin' && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p className="font-bold text-neutral-900 mb-2">Sesuaikan Hak Akses Fitur (Custom Permissions):</p>
                  <div className="space-y-2">
                    {ALL_PERMISSIONS.map(p => {
                      const isChecked = permissions.includes(p.key);
                      return (
                        <label 
                          key={p.key}
                          className="flex items-start gap-2 cursor-pointer hover:bg-neutral-100 p-1.5 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(p.key)}
                            className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                          />
                          <div>
                            <div className="font-semibold text-neutral-800">{p.label}</div>
                            <div className="text-[10px] text-neutral-500">{p.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-xl text-neutral-700 font-medium hover:bg-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  Simpan Akun Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
