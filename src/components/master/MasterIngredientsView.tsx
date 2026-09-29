import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Boxes, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Search, 
  CheckCircle, 
  X 
} from 'lucide-react';
import { Ingredient, UnitType } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';

export const MasterIngredientsView: React.FC = () => {
  const { 
    ingredients, 
    addIngredient, 
    updateIngredient, 
    deleteIngredient,
    units,
    categories,
    setActiveTab
  } = useApp();

  const ingredientCategories = categories.filter(c => c.type === 'ingredient' || c.type === 'general' || !c.type);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(ingredientCategories[0]?.name || 'Bahan Minuman');
  const [unit, setUnit] = useState<UnitType>(units[0]?.code || 'gr');
  const [currentStock, setCurrentStock] = useState<number>(1000);
  const [minStock, setMinStock] = useState<number>(200);
  const [costPerUnit, setCostPerUnit] = useState<number>(50);
  const [supplierName, setSupplierName] = useState('');
  const [notice, setNotice] = useState('');

  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setName('');
    setSku(`ING-${Date.now().toString().slice(-4)}`);
    setCategory(ingredientCategories[0]?.name || 'Bahan Minuman');
    setUnit(units[0]?.code || 'gr');
    setCurrentStock(1000);
    setMinStock(200);
    setCostPerUnit(50);
    setSupplierName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setName(ing.name);
    setSku(ing.sku);
    setCategory(ing.category);
    setUnit(ing.unit);
    setCurrentStock(ing.currentStock);
    setMinStock(ing.minStock);
    setCostPerUnit(ing.costPerUnit);
    setSupplierName(ing.supplierName || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingIngredient) {
      updateIngredient({
        ...editingIngredient,
        name,
        sku,
        category,
        unit,
        currentStock,
        minStock,
        costPerUnit,
        supplierName,
        updatedAt: Date.now(),
      });
      setNotice(`Bahan baku "${name}" berhasil diperbarui!`);
    } else {
      addIngredient({
        name,
        sku: sku || `ING-${Date.now().toString().slice(-4)}`,
        category,
        unit,
        currentStock,
        minStock,
        costPerUnit,
        supplierName,
      });
      setNotice(`Bahan baku baru "${name}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setNotice(''), 3500);
  };

  const filtered = ingredients.filter(i => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    const matchesCat = selectedCategoryFilter === 'all' || i.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Master Data Bahan Baku
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Database bahan baku dasar untuk formula resep BOM dan perhitungan HPP otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className="px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            title="Kelola Satuan & Kategori di Menu Pengaturan"
          >
            ⚙ Kelola Satuan & Kategori
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahan Baku</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari bahan baku, SKU, kategori..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Kategori:</label>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kategori ({ingredients.length})</option>
            {ingredientCategories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name} ({ingredients.filter(i => i.category === c.name).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Bahan Baku</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Stok Fisik Saat Ini</th>
                <th className="py-3 px-4 text-right">Min. Safety Stok</th>
                <th className="py-3 px-4 text-right">Harga Beli / Satuan</th>
                <th className="py-3 px-4">Pemasok / Supplier</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(ing => {
                const isLow = ing.currentStock <= ing.minStock;
                return (
                  <tr key={ing.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{ing.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ing.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ing.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        isLow ? 'text-amber-700 font-extrabold' : 'text-slate-900'
                      }`}>
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        {formatNumber(ing.currentStock)} {ing.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono tabular-nums">
                      {formatNumber(ing.minStock)} {ing.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800 tabular-nums">
                      {formatRupiah(ing.costPerUnit)} / {ing.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ing.supplierName || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(ing)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
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
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingIngredient ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
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
                <label className="block font-bold text-slate-700 mb-1">Nama Bahan Baku:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Biji Kopi Arabica"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode SKU:</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Satuan Dasar:</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setActiveTab('settings');
                      }}
                      className="text-[10px] text-emerald-600 hover:underline"
                    >
                      + Atur Satuan
                    </button>
                  </div>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white font-semibold text-slate-900"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.code}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                    {!units.some(u => u.code.toLowerCase() === (unit || '').toLowerCase()) && (
                      <option value={unit}>{unit}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Harga Beli per {unit} (Rp):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono tabular-nums font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Kategori Bahan:</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setActiveTab('settings');
                      }}
                      className="text-[10px] text-emerald-600 hover:underline"
                    >
                      + Atur Kategori
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white font-semibold text-slate-900"
                  >
                    {ingredientCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {!ingredientCategories.some(c => c.name === category) && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Saat Ini:</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batas Min. Stok:</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pemasok / Supplier:</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="PT Supplier Utama"
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
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
