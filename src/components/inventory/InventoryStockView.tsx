import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Warehouse, 
  Search, 
  AlertTriangle, 
  ClipboardCheck, 
  FileText, 
  ArrowDownUp, 
  CheckCircle,
  Plus
} from 'lucide-react';
import { formatNumber, formatDateTime, formatRupiah } from '../../utils/formatters';

export const InventoryStockView: React.FC = () => {
  const { 
    ingredients, 
    products, 
    stockMovements, 
    performStockOpname, 
    setActiveTab, 
    lowStockItemsCount 
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'materials' | 'finished' | 'opname' | 'ledger'>('materials');
  const [searchQuery, setSearchQuery] = useState('');

  // Opname form
  const [opnameItemId, setOpnameItemId] = useState(ingredients[0]?.id || '');
  const [opnameActual, setOpnameActual] = useState<number>(0);
  const [opnameNotes, setOpnameNotes] = useState('');
  const [notice, setNotice] = useState('');

  const handleOpnameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ing = ingredients.find(i => i.id === opnameItemId);
    if (!ing) return;

    performStockOpname(ing.id, 'ingredient', opnameActual, opnameNotes || 'Audit Stok Fisik');
    setNotice(`Penyesuaian stok opname "${ing.name}" menjadi ${opnameActual} ${ing.unit} berhasil dicatat!`);
    setOpnameNotes('');
    setTimeout(() => setNotice(''), 3500);
  };

  const filteredIngredients = ingredients.filter(i => {
    const q = searchQuery.toLowerCase().trim();
    return !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
  });

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Warehouse className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Inventory & Manajemen Stok
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring ketersediaan bahan baku, stok barang jadi, penyesuaian opname fisik, dan kartu mutasi stok real-time.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs">
          <button
            onClick={() => setActiveTabSub('materials')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTabSub === 'materials' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stok Bahan Baku ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveTabSub('finished')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTabSub === 'finished' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stok Produk Jadi ({products.length})
          </button>
          <button
            onClick={() => setActiveTabSub('opname')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTabSub === 'opname' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stok Opname
          </button>
          <button
            onClick={() => setActiveTabSub('ledger')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTabSub === 'ledger' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kartu Mutasi
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Subtab 1: Bahan Baku */}
      {activeTabSub === 'materials' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center gap-3">
            <div className="max-w-sm w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bahan baku..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <button
              onClick={() => setActiveTab('purchases')}
              className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Restock Bahan</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Bahan Baku</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Stok Fisik Tersedia</th>
                  <th className="py-3 px-4 text-right">Batas Min. Stok</th>
                  <th className="py-3 px-4 text-right">Nilai Satuan</th>
                  <th className="py-3 px-4 text-right">Total Nilai Persediaan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIngredients.map(ing => {
                  const isLow = ing.currentStock <= ing.minStock;
                  return (
                    <tr key={ing.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{ing.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ing.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{ing.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-sm tabular-nums text-slate-900">
                        {formatNumber(ing.currentStock)} {ing.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                        {formatNumber(ing.minStock)} {ing.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums font-semibold">
                        {formatRupiah(ing.costPerUnit)} / {ing.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800 tabular-nums">
                        {formatRupiah(ing.costPerUnit * ing.currentStock)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-500" /> Menipis
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Produk Jadi */}
      {activeTabSub === 'finished' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Produk Jadi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Stok Fisik Jadi</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">HPP Modal</th>
                <th className="py-3 px-4">Sistem Resep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{p.categoryName}</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-sm tabular-nums text-slate-900">
                    {p.trackStock ? `${p.currentStock} pcs` : 'Otomatis via Resep'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">
                    {formatRupiah(p.price)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                    {formatRupiah(p.cogs)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {p.hasRecipe ? 'BOM Terhubung' : 'Manual / Non-Resep'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subtab 3: Stok Opname */}
      {activeTabSub === 'opname' && (
        <div className="max-w-lg mx-auto bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Penyesuaian Fisik (Stok Opname)</h3>
          </div>

          <form onSubmit={handleOpnameSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Bahan Baku:</label>
              <select
                value={opnameItemId}
                onChange={(e) => {
                  setOpnameItemId(e.target.value);
                  const selected = ingredients.find(i => i.id === e.target.value);
                  if (selected) setOpnameActual(selected.currentStock);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white font-medium"
              >
                {ingredients.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Sistem: {i.currentStock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const ing = ingredients.find(i => i.id === opnameItemId);
              const systemStock = ing ? ing.currentStock : 0;
              const diff = opnameActual - systemStock;

              return (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500">Stok Sistem:</span>
                      <p className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                        {systemStock} {ing?.unit}
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hitungan Fisik Nyata:</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={opnameActual}
                        onChange={(e) => setOpnameActual(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono tabular-nums text-base font-extrabold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    diff === 0 
                      ? 'bg-slate-50 border-slate-200 text-slate-700' 
                      : diff > 0 
                      ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold' 
                      : 'bg-red-50 border-red-200 text-red-900 font-bold'
                  }`}>
                    <span>Selisih Fisik vs Sistem:</span>
                    <span className="font-mono tabular-nums">
                      {diff === 0 ? 'Sesuai (0)' : diff > 0 ? `+${diff} ${ing?.unit} (Surplus)` : `${diff} ${ing?.unit} (Selisih Kurang)`}
                    </span>
                  </div>
                </>
              );
            })()}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alasan Penyesuaian:</label>
              <textarea
                value={opnameNotes}
                onChange={(e) => setOpnameNotes(e.target.value)}
                placeholder="Penyusutan bahan, tumpah, audit mingguan..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              Simpan Opname
            </button>
          </form>
        </div>
      )}

      {/* Subtab 4: Kartu Mutasi */}
      {activeTabSub === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Tipe Mutasi</th>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4 text-right">Perubahan Qty</th>
                <th className="py-3 px-4 text-right">Sisa Stok Akhir</th>
                <th className="py-3 px-4">Keterangan / Faktur</th>
                <th className="py-3 px-4">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockMovements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                    {formatDateTime(m.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      m.type === 'sale' 
                        ? 'bg-amber-100 text-amber-800' 
                        : m.type === 'restock' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {m.type === 'sale' ? 'Penjualan POS' : m.type === 'restock' ? 'Restock PO' : 'Opname'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{m.itemName}</td>
                  <td className={`py-3 px-4 text-right font-mono font-extrabold tabular-nums ${
                    m.changeQty > 0 ? 'text-emerald-700' : 'text-slate-900'
                  }`}>
                    {m.changeQty > 0 ? `+${m.changeQty}` : m.changeQty} {m.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {m.newStock} {m.unit}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {m.notes || m.referenceId || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{m.staffName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
