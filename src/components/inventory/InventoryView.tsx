import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Boxes, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  ArrowDownUp, 
  PackagePlus, 
  ClipboardCheck, 
  Search, 
  CheckCircle, 
  X,
  FileText
} from 'lucide-react';
import { Ingredient, UnitType } from '../../types';
import { formatRupiah, formatDateTime, formatNumber } from '../../utils/formatters';

export const InventoryView: React.FC = () => {
  const { 
    ingredients, 
    addIngredient, 
    updateIngredient, 
    deleteIngredient, 
    stockMovements, 
    performStockOpname, 
    recordRestock, 
    currentUser,
    units,
    categories 
  } = useApp();

  const ingredientCategories = categories.filter(c => c.type === 'ingredient' || c.type === 'general' || !c.type);

  const [activeSubTab, setActiveSubTab] = useState<'ingredients' | 'restock' | 'opname' | 'ledger'>('ingredients');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Form State for Add / Edit Ingredient
  const [ingName, setIngName] = useState('');
  const [ingSku, setIngSku] = useState('');
  const [ingCategory, setIngCategory] = useState('Bahan Minuman');
  const [ingUnit, setIngUnit] = useState<UnitType>('gr');
  const [ingStock, setIngStock] = useState<number>(1000);
  const [ingMinStock, setIngMinStock] = useState<number>(200);
  const [ingCost, setIngCost] = useState<number>(50);
  const [ingSupplier, setIngSupplier] = useState('');

  // Restock Form State
  const [restockItemId, setRestockItemId] = useState(ingredients[0]?.id || '');
  const [restockQty, setRestockQty] = useState<number>(1000);
  const [restockCostPerUnit, setRestockCostPerUnit] = useState<number>(0);
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockNotes, setRestockNotes] = useState('');
  const [restockTotalAmount, setRestockTotalAmount] = useState<number>(0);

  // Opname Form State
  const [opnameItemId, setOpnameItemId] = useState(ingredients[0]?.id || '');
  const [opnameActualStock, setOpnameActualStock] = useState<number>(0);
  const [opnameNotes, setOpnameNotes] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  const showNotice = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Open Edit Ingredient
  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setIngName(ing.name);
    setIngSku(ing.sku);
    setIngCategory(ing.category);
    setIngUnit(ing.unit);
    setIngStock(ing.currentStock);
    setIngMinStock(ing.minStock);
    setIngCost(ing.costPerUnit);
    setIngSupplier(ing.supplierName || '');
    setIsAddIngredientModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setIngName('');
    setIngSku(`ING-${Date.now().toString().slice(-4)}`);
    setIngCategory('Bahan Minuman');
    setIngUnit('gr');
    setIngStock(1000);
    setIngMinStock(200);
    setIngCost(50);
    setIngSupplier('');
    setIsAddIngredientModalOpen(true);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName.trim()) return;

    if (editingIngredient) {
      updateIngredient({
        ...editingIngredient,
        name: ingName,
        sku: ingSku,
        category: ingCategory,
        unit: ingUnit,
        currentStock: ingStock,
        minStock: ingMinStock,
        costPerUnit: ingCost,
        supplierName: ingSupplier,
        updatedAt: Date.now(),
      });
      showNotice(`Bahan baku "${ingName}" berhasil diperbarui!`);
    } else {
      addIngredient({
        name: ingName,
        sku: ingSku || `ING-${Date.now().toString().slice(-4)}`,
        category: ingCategory,
        unit: ingUnit,
        currentStock: ingStock,
        minStock: ingMinStock,
        costPerUnit: ingCost,
        supplierName: ingSupplier,
      });
      showNotice(`Bahan baku baru "${ingName}" berhasil ditambahkan!`);
    }

    setIsAddIngredientModalOpen(false);
  };

  // Restock Submit
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ing = ingredients.find(i => i.id === restockItemId);
    if (!ing || restockQty <= 0) return;

    const unitPrice = restockCostPerUnit > 0 ? restockCostPerUnit : ing.costPerUnit;
    const total = restockTotalAmount > 0 ? restockTotalAmount : unitPrice * restockQty;

    recordRestock({
      itemId: ing.id,
      itemType: 'ingredient',
      addedQty: restockQty,
      costPerUnit: unitPrice,
      supplierName: restockSupplier || ing.supplierName,
      totalAmount: total,
      notes: restockNotes,
    });

    showNotice(`Restock +${restockQty} ${ing.unit} untuk "${ing.name}" berhasil dicatat!`);
    setRestockQty(1000);
    setRestockNotes('');
    setRestockTotalAmount(0);
  };

  // Opname Submit
  const handleOpnameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ing = ingredients.find(i => i.id === opnameItemId);
    if (!ing) return;

    performStockOpname(ing.id, 'ingredient', opnameActualStock, opnameNotes || 'Audit Stok Fisik');
    showNotice(`Penyesuaian stok opname "${ing.name}" menjadi ${opnameActualStock} ${ing.unit} berhasil!`);
    setOpnameNotes('');
  };

  // Filter ingredients
  const filteredIngredients = ingredients.filter(i => {
    const q = searchQuery.toLowerCase().trim();
    return !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Manajemen Bahan Baku & Stok Otomatis
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kontrol stok bahan mentah, pembelian restock, stok opname, dan kartu mutasi stok real-time.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs">
          <button
            onClick={() => setActiveSubTab('ingredients')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'ingredients' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bahan Baku ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveSubTab('restock')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'restock' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Restock PO
          </button>
          <button
            onClick={() => setActiveSubTab('opname')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'opname' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stok Opname
          </button>
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'ledger' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kartu Mutasi
          </button>
        </div>
      </div>

      {/* Success Notice */}
      {successMessage && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SUB-TAB 1: INGREDIENTS LIST */}
      {activeSubTab === 'ingredients' && (
        <div className="mt-4 space-y-3">
          {/* Controls: Search and Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bahan baku atau SKU..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Bahan Baku</span>
            </button>
          </div>

          {/* Ingredients Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Nama Bahan</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-right">Stok Saat Ini</th>
                    <th className="py-3 px-4 text-right">Min. Safety Stok</th>
                    <th className="py-3 px-4 text-right">Harga Beli / Satuan</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredIngredients.map(ing => {
                    const isLow = ing.currentStock <= ing.minStock;
                    return (
                      <tr key={ing.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-neutral-900">{ing.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{ing.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {ing.category}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            isLow ? 'text-amber-700 font-bold' : 'text-neutral-900'
                          }`}>
                            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                            {formatNumber(ing.currentStock)} {ing.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-500 font-mono tabular-nums">
                          {formatNumber(ing.minStock)} {ing.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                          {formatRupiah(ing.costPerUnit)} / {ing.unit}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {ing.supplierName || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(ing)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Edit Bahan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus bahan baku "${ing.name}"?`)) {
                                  deleteIngredient(ing.id);
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Bahan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RESTOCK / PURCHASE ORDER */}
      {activeSubTab === 'restock' && (
        <div className="mt-4 max-w-xl mx-auto bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
            <PackagePlus className="w-5 h-5 text-neutral-900" />
            <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
              Penerimaan Barang / Restock Bahan Baku
            </h3>
          </div>

          <form onSubmit={handleRestockSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Pilih Bahan Baku:
              </label>
              <select
                value={restockItemId}
                onChange={(e) => {
                  setRestockItemId(e.target.value);
                  const selected = ingredients.find(i => i.id === e.target.value);
                  if (selected) {
                    setRestockCostPerUnit(selected.costPerUnit);
                    setRestockSupplier(selected.supplierName || '');
                  }
                }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
              >
                {ingredients.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Stok Saat Ini: {i.currentStock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Jumlah Tambahan:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono tabular-nums text-sm font-bold"
                  />
                  <span className="font-mono text-neutral-500 font-semibold">
                    {ingredients.find(i => i.id === restockItemId)?.unit || 'unit'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Harga Beli per Satuan (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={restockCostPerUnit || ''}
                  onChange={(e) => setRestockCostPerUnit(Number(e.target.value) || 0)}
                  placeholder="Rp 0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Nama Supplier / Toko Pemasok:
              </label>
              <input
                type="text"
                value={restockSupplier}
                onChange={(e) => setRestockSupplier(e.target.value)}
                placeholder="Contoh: PT Dairy Mandiri"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Catatan Restock / No. Surat Jalan:
              </label>
              <input
                type="text"
                value={restockNotes}
                onChange={(e) => setRestockNotes(e.target.value)}
                placeholder="Pengiriman berkala mingguan..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Estimated Total Calculation */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center">
              <span className="text-neutral-600 font-medium">Total Nilai Pembelian:</span>
              <span className="font-bold text-sm font-mono tabular-nums text-neutral-900">
                {formatRupiah(restockCostPerUnit * restockQty)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Simpan Penerimaan Restock
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: STOK OPNAME */}
      {activeSubTab === 'opname' && (
        <div className="mt-4 max-w-xl mx-auto bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
            <ClipboardCheck className="w-5 h-5 text-neutral-900" />
            <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
              Penyesuaian Fisik (Stok Opname)
            </h3>
          </div>

          <form onSubmit={handleOpnameSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Pilih Bahan Baku:
              </label>
              <select
                value={opnameItemId}
                onChange={(e) => {
                  setOpnameItemId(e.target.value);
                  const selected = ingredients.find(i => i.id === e.target.value);
                  if (selected) setOpnameActualStock(selected.currentStock);
                }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
              >
                {ingredients.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Sistem: {i.currentStock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Current vs Actual */}
            {(() => {
              const ing = ingredients.find(i => i.id === opnameItemId);
              const systemStock = ing ? ing.currentStock : 0;
              const diff = opnameActualStock - systemStock;

              return (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <span className="text-[11px] text-neutral-500">Stok di Sistem:</span>
                      <p className="text-base font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
                        {formatNumber(systemStock)} {ing?.unit}
                      </p>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Hitungan Fisik Nyata:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={opnameActualStock}
                        onChange={(e) => setOpnameActualStock(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono tabular-nums text-base font-bold text-neutral-900"
                      />
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    diff === 0 
                      ? 'bg-neutral-50 border-neutral-200 text-neutral-700' 
                      : diff > 0 
                      ? 'bg-blue-50 border-blue-200 text-blue-900' 
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}>
                    <span className="font-semibold">Selisih Penyesuaian:</span>
                    <span className="font-mono font-bold text-sm tabular-nums">
                      {diff === 0 ? 'Sesuai (0)' : diff > 0 ? `+${diff} ${ing?.unit} (Surplus)` : `${diff} ${ing?.unit} (Selisih Kurang)`}
                    </span>
                  </div>
                </>
              );
            })()}

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Alasan / Catatan Penyesuaian:
              </label>
              <textarea
                value={opnameNotes}
                onChange={(e) => setOpnameNotes(e.target.value)}
                placeholder="Contoh: Penyusutan bahan saat peracikan, tumpah, atau audit bulanan..."
                rows={2}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Simpan Penyesuaian Opname
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: STOCK LEDGER / KARTU MUTASI */}
      {activeSubTab === 'ledger' && (
        <div className="mt-4 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-700" />
              <h3 className="font-bold text-neutral-900 text-sm">
                Riwayat Mutasi Stok Otomatis (Stock Ledger)
              </h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              Total {stockMovements.length} transaksi mutasi tercatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Waktu</th>
                  <th className="py-2.5 px-4">Tipe Mutasi</th>
                  <th className="py-2.5 px-4">Nama Item</th>
                  <th className="py-2.5 px-4 text-right">Perubahan Qty</th>
                  <th className="py-2.5 px-4 text-right">Sisa Stok Akhir</th>
                  <th className="py-2.5 px-4">Keterangan / No. Ref</th>
                  <th className="py-2.5 px-4">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {stockMovements.slice(0, 30).map(m => {
                  const isPositive = m.changeQty > 0;
                  return (
                    <tr key={m.id} className="hover:bg-neutral-50/60">
                      <td className="py-2.5 px-4 text-neutral-500 font-mono whitespace-nowrap">
                        {formatDateTime(m.timestamp)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                          m.type === 'sale' 
                            ? 'bg-amber-100 text-amber-800' 
                            : m.type === 'restock' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-neutral-100 text-neutral-800'
                        }`}>
                          {m.type === 'sale' ? 'Penjualan' : m.type === 'restock' ? 'Restock' : 'Opname'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">
                        {m.itemName}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums ${
                        isPositive ? 'text-emerald-700' : 'text-neutral-900'
                      }`}>
                        {isPositive ? `+${m.changeQty}` : m.changeQty} {m.unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-neutral-800">
                        {m.newStock} {m.unit}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-600 max-w-xs truncate">
                        {m.notes || m.referenceId || '-'}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-500">
                        {m.staffName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT INGREDIENT */}
      {isAddIngredientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-neutral-200 relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">
                {editingIngredient ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
              </h3>
              <button
                onClick={() => setIsAddIngredientModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nama Bahan Baku:</label>
                <input
                  type="text"
                  required
                  value={ingName}
                  onChange={(e) => setIngName(e.target.value)}
                  placeholder="Contoh: Biji Kopi House Blend"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Kode SKU:</label>
                  <input
                    type="text"
                    value={ingSku}
                    onChange={(e) => setIngSku(e.target.value)}
                    placeholder="ING-01"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Satuan Dasar:</label>
                  <select
                    value={ingUnit}
                    onChange={(e) => setIngUnit(e.target.value as UnitType)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white font-semibold"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.code}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                    {!units.some(u => u.code.toLowerCase() === (ingUnit || '').toLowerCase()) && (
                      <option value={ingUnit}>{ingUnit}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Harga Beli per {ingUnit} (Rp):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={ingCost}
                    onChange={(e) => setIngCost(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Kategori:</label>
                  <select
                    value={ingCategory}
                    onChange={(e) => setIngCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white font-semibold"
                  >
                    {ingredientCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {!ingredientCategories.some(c => c.name === ingCategory) && (
                      <option value={ingCategory}>{ingCategory}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Stok Saat Ini:</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={ingStock}
                    onChange={(e) => setIngStock(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Batas Min. Stok:</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={ingMinStock}
                    onChange={(e) => setIngMinStock(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nama Pemasok / Supplier:</label>
                <input
                  type="text"
                  value={ingSupplier}
                  onChange={(e) => setIngSupplier(e.target.value)}
                  placeholder="PT Supplier Makanan"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddIngredientModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-xl text-neutral-700 font-medium hover:bg-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  Simpan Bahan Baku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
