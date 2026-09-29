import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  CheckCircle, 
  X 
} from 'lucide-react';
import { Supplier } from '../../types';
import { formatRupiah } from '../../utils/formatters';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [itemsSuppliedStr, setItemsSuppliedStr] = useState('');
  const [notice, setNotice] = useState('');

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setItemsSuppliedStr('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setName(s.name);
    setContactPerson(s.contactPerson || '');
    setPhone(s.phone);
    setEmail(s.email || '');
    setAddress(s.address || '');
    setItemsSuppliedStr(s.itemsSupplied.join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const itemsSupplied = itemsSuppliedStr.split(',').map(i => i.trim()).filter(Boolean);

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        name,
        contactPerson,
        phone,
        email,
        address,
        itemsSupplied,
      });
      setNotice(`Supplier "${name}" berhasil diperbarui!`);
    } else {
      addSupplier({
        name,
        contactPerson,
        phone,
        email,
        address,
        itemsSupplied,
      });
      setNotice(`Supplier baru "${name}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setNotice(''), 3500);
  };

  const filtered = suppliers.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    return !q || s.name.toLowerCase().includes(q) || s.phone.includes(q) || (s.contactPerson && s.contactPerson.toLowerCase().includes(q));
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Master Data Supplier
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data vendor dan supplier pemasok bahan baku, kontak PIC, dan riwayat pesanan restock.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Supplier</span>
        </button>
      </div>

      {notice && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="mt-4 max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari supplier, PIC, telepon..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Perusahaan / Supplier</th>
                <th className="py-3 px-4">PIC / Kontak Person</th>
                <th className="py-3 px-4">Telepon & Alamat</th>
                <th className="py-3 px-4">Bahan yang Dipasok</th>
                <th className="py-3 px-4 text-right">Total Pembelian</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(sup => (
                <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">{sup.name}</div>
                    {sup.email && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sup.email}</div>}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {sup.contactPerson || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-mono text-slate-900 font-bold">{sup.phone}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{sup.address || '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {sup.itemsSupplied.map((it, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium">
                          {it}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800 tabular-nums">
                    {formatRupiah(sup.totalPurchases)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(sup)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Data"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data supplier "${sup.name}"?`)) {
                            deleteSupplier(sup.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan / Supplier:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PT Sumber Pangan Makmur"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Kontak Person (PIC):</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Bpk. Hendra"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon / WA:</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Supplier:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="order@supplier.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Kantor / Gudang:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Industri No. 5..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bahan yang Dipasok (Pisahkan dengan koma):</label>
                <input
                  type="text"
                  value={itemsSuppliedStr}
                  onChange={(e) => setItemsSuppliedStr(e.target.value)}
                  placeholder="Biji Kopi, Sirup Gula Aren, Cup 16oz"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  Simpan Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
