import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Building2, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Clock, 
  ArrowDownRight,
  Filter,
  PackagePlus,
  Boxes,
  FileText,
  DollarSign
} from 'lucide-react';
import { formatRupiah, formatDateTime, formatNumber } from '../../utils/formatters';

export const PurchasesView: React.FC = () => {
  const { 
    ingredients, 
    products, 
    suppliers, 
    stockMovements, 
    recordRestock, 
    currentUser,
    addExpense
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ingredient' | 'product'>('all');

  // Form State
  const [itemType, setItemType] = useState<'ingredient' | 'product'>('ingredient');
  const [selectedItemId, setSelectedItemId] = useState(ingredients[0]?.id || '');
  const [selectedSupplier, setSelectedSupplier] = useState(suppliers[0]?.name || 'Supplier Umum');
  const [qty, setQty] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'tempo'>('lunas');
  const [notes, setNotes] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // When selectedItemId changes, auto-fill unitCost if available
  const currentItem = itemType === 'ingredient' 
    ? ingredients.find(i => i.id === selectedItemId)
    : products.find(p => p.id === selectedItemId);

  const selectedUnit = itemType === 'ingredient' 
    ? (currentItem as any)?.unit || 'gr'
    : 'pcs';

  const totalPurchaseCost = qty * unitCost;

  // Filter restock movements from stockMovements
  const purchaseMovements = stockMovements.filter(m => m.type === 'restock');

  const filteredPurchases = purchaseMovements.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      p.itemName.toLowerCase().includes(q) || 
      (p.notes && p.notes.toLowerCase().includes(q)) ||
      (p.staffName && p.staffName.toLowerCase().includes(q));
    
    const matchType = filterType === 'all' || p.itemType === filterType;
    return matchQuery && matchType;
  });

  const handleOpenModal = () => {
    if (ingredients.length > 0) {
      setItemType('ingredient');
      setSelectedItemId(ingredients[0].id);
      setUnitCost(ingredients[0].costPerUnit || 0);
    }
    setQty(10);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleItemChange = (id: string, type: 'ingredient' | 'product') => {
    setSelectedItemId(id);
    if (type === 'ingredient') {
      const ing = ingredients.find(i => i.id === id);
      if (ing) setUnitCost(ing.costPerUnit || 0);
    } else {
      const prod = products.find(p => p.id === id);
      if (prod) setUnitCost(prod.cogs || 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || qty <= 0) return;

    recordRestock({
      itemId: selectedItemId,
      itemType,
      addedQty: qty,
      costPerUnit: unitCost,
      supplierName: selectedSupplier,
      totalAmount: totalPurchaseCost,
      notes: `${paymentStatus === 'lunas' ? '[LUNAS]' : '[TEMPO]'} Supplier: ${selectedSupplier}. ${notes}`.trim()
    });

    // Also record expense if paid
    if (paymentStatus === 'lunas' && totalPurchaseCost > 0) {
      addExpense({
        date: new Date().toISOString().slice(0, 10),
        category: 'Perlengkapan & Operasional',
        description: `Kulakan ${currentItem?.name || 'Item'} (${qty} ${selectedUnit}) dari ${selectedSupplier}`,
        amount: totalPurchaseCost,
        recordedBy: currentUser.name
      });
    }

    setSuccessNotice(`Pembelian ${currentItem?.name} sebanyak ${qty} ${selectedUnit} berhasil dicatat & stok bertambah!`);
    setIsModalOpen(false);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const totalSpentAllPurchases = purchaseMovements.reduce((sum, p) => {
    return sum + (p.changeQty * 0); // stored or aggregated
  }, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none space-y-4">
      {/* Success Notification */}
      {successNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} className="text-emerald-700 hover:text-emerald-950">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pembelian & Kulakan Bahan
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {purchaseMovements.length} Transaksi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan faktur pembelian, kulakan bahan baku / produk, dan update stok masuk otomatis.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <PackagePlus className="w-4 h-4" />
          <span>Catat Pembelian Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total Transaksi Masuk</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {purchaseMovements.length} Faktur
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Semua riwayat kulakan stok</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Bahan Baku Terdaftar</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {ingredients.length} Item
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Siap untuk di-restock</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Mitra Supplier Aktif</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {suppliers.length} Vendor
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pemasok bahan baku toko</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari item, supplier, catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 font-bold transition-colors ${filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('ingredient')}
              className={`px-3 py-1.5 font-bold transition-colors ${filterType === 'ingredient' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Bahan Baku
            </button>
            <button
              onClick={() => setFilterType('product')}
              className={`px-3 py-1.5 font-bold transition-colors ${filterType === 'product' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Produk Jadi
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Nama Item</th>
                <th className="px-4 py-3 text-right">Jumlah Masuk</th>
                <th className="px-4 py-3 text-right">Stok Akhir</th>
                <th className="px-4 py-3">Petugas</th>
                <th className="px-4 py-3">Catatan / Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Belum ada riwayat pembelian atau pencarian tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                      {formatDateTime(purchase.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        purchase.itemType === 'ingredient' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {purchase.itemType === 'ingredient' ? 'Bahan Baku' : 'Produk'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {purchase.itemName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                      +{formatNumber(purchase.changeQty)} {purchase.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {formatNumber(purchase.newStock)} {purchase.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {purchase.staffName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {purchase.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Pembelian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Catat Pembelian & Restock</h3>
                <p className="text-xs text-slate-500 mt-0.5">Stok gudang akan otomatis bertambah</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Tipe Item */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tipe Item</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setItemType('ingredient');
                      if (ingredients.length > 0) handleItemChange(ingredients[0].id, 'ingredient');
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all text-center ${
                      itemType === 'ingredient' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Bahan Baku (Resep)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItemType('product');
                      if (products.length > 0) handleItemChange(products[0].id, 'product');
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all text-center ${
                      itemType === 'product' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Produk Jadi
                  </button>
                </div>
              </div>

              {/* Pilih Item */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih {itemType === 'ingredient' ? 'Bahan Baku' : 'Produk'}
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => handleItemChange(e.target.value, itemType)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {itemType === 'ingredient' ? (
                    ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} (Stok: {formatNumber(ing.currentStock)} {ing.unit})
                      </option>
                    ))
                  ) : (
                    products.map(prod => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} (Stok: {formatNumber(prod.currentStock)} pcs)
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Supplier & Status Bayar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="Supplier Umum / Pasar">Supplier Umum / Pasar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="lunas">Lunas (Catat ke Pengeluaran)</option>
                    <option value="tempo">Tempo / Hutang Dagang</option>
                  </select>
                </div>
              </div>

              {/* Quantity & Unit Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jumlah Masuk ({selectedUnit})
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={qty}
                    onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Harga Beli Satuan (Rp / {selectedUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-950">
                <span>Total Estimasi Biaya:</span>
                <span className="font-mono text-sm">{formatRupiah(totalPurchaseCost)}</span>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">No. Faktur / Catatan Pembelian</label>
                <input
                  type="text"
                  placeholder="Contoh: Faktur #INV-2026-001 dari Buana Sari"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
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
                  Simpan & Tambah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
