import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Tag, 
  Plus, 
  Search, 
  Percent, 
  DollarSign, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from 'lucide-react';
import { PromoDiscount } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';

export const DiscountsView: React.FC = () => {
  const { promos, addPromo, updatePromo, deletePromo } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoDiscount | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'nominal'>('percent');
  const [value, setValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<number>(50000);
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');

  const filteredPromos = promos.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  const handleOpenAdd = () => {
    setEditingPromo(null);
    setName('');
    setCode('PROMO' + Math.floor(100 + Math.random() * 900));
    setType('percent');
    setValue(10);
    setMinPurchase(50000);
    setActive(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PromoDiscount) => {
    setEditingPromo(p);
    setName(p.name);
    setCode(p.code);
    setType(p.type);
    setValue(p.value);
    setMinPurchase(p.minPurchase);
    setActive(p.active);
    setNotes(p.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || value <= 0) return;

    if (editingPromo) {
      updatePromo({
        ...editingPromo,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        value,
        minPurchase,
        active,
        notes: notes.trim()
      });
      setNotice(`Promo "${name}" berhasil diperbarui!`);
    } else {
      addPromo({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        value,
        minPurchase,
        active,
        notes: notes.trim()
      });
      setNotice(`Promo baru "${name}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleToggleActive = (p: PromoDiscount) => {
    updatePromo({ ...p, active: !p.active });
    setNotice(`Status promo "${p.name}" diubah menjadi ${!p.active ? 'Aktif' : 'Nonaktif'}`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleDelete = (id: string, promoName: string) => {
    if (window.confirm(`Yakin ingin menghapus promo "${promoName}"?`)) {
      deletePromo(id);
      setNotice(`Promo "${promoName}" telah dihapus.`);
      setTimeout(() => setNotice(''), 3000);
    }
  };

  const handleCopy = (promoCode: string) => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(promoCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none space-y-4">
      {/* Notice Banner */}
      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Promo & Diskon Kasir
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {promos.filter(p => p.active).length} Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola kode voucher diskon, potongan persentase, dan nominal promo untuk kasir POS.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Promo Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total Voucher Promo</span>
            <Tag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {promos.length} Program
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Voucher terdaftar dalam sistem</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Promo Siap Digunakan</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 font-mono">
            {promos.filter(p => p.active).length} Siap Pakai
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dapat diaplikasikan di POS Kasir</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Potongan Tertinggi</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {promos.length > 0 ? `${Math.max(...promos.map(p => p.type === 'percent' ? p.value : 0))}%` : '0%'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Diskon persentase maksimal</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari voucher, kode kupon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Promos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPromos.map((promo) => (
          <div
            key={promo.id}
            className={`bg-white rounded-2xl border p-4 shadow-2xs transition-all flex flex-col justify-between ${
              promo.active ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    promo.type === 'percent' 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {promo.type === 'percent' ? `Diskon ${promo.value}%` : `Potongan ${formatRupiah(promo.value)}`}
                  </span>
                  {promo.active ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500">
                      Nonaktif
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(promo)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title={promo.active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {promo.active ? (
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(promo)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Edit Promo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id, promo.name)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Hapus Promo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-extrabold text-slate-900 text-sm mb-1">{promo.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{promo.notes || 'Berlaku untuk semua menu'}</p>

              {/* Promo Code Box */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 mb-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Kode Kupon</div>
                  <div className="font-mono font-extrabold text-sm text-slate-900 tracking-wider">
                    {promo.code}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(promo.code)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-bold shadow-2xs transition-colors"
                >
                  {copiedCode === promo.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Min. Belanja:</span>
              <span className="font-mono font-bold text-slate-800">
                {promo.minPurchase > 0 ? formatRupiah(promo.minPurchase) : 'Tanpa Minimum'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingPromo ? 'Edit Promo / Diskon' : 'Tambah Promo Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Promo</label>
                <input
                  type="text"
                  placeholder="Contoh: Diskon Jam Istirahat 15%"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Voucher</label>
                <input
                  type="text"
                  placeholder="KODE15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Diskon</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="percent">Persentase (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nilai ({type === 'percent' ? '%' : 'Rp'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={type === 'percent' ? 100 : undefined}
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Minimum Pembelian (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Syarat Ketentuan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Berlaku dari jam 12:00 - 15:00 WIB"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="activeToggle" className="font-semibold text-slate-700">
                  Aktifkan promo ini sekarang
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {editingPromo ? 'Simpan Perubahan' : 'Buat Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
