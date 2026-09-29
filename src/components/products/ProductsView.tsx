import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calculator, 
  CheckCircle, 
  X, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah, calculateGrossMarginPercent } from '../../utils/formatters';

export const ProductsView: React.FC = () => {
  const { 
    products, 
    categories, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    setActiveTab 
  } = useApp();

  const productCategories = categories.filter(c => c.type === 'product' || c.type === 'general' || !c.type);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(productCategories[0]?.id || categories[0]?.id || '');
  const [price, setPrice] = useState<number>(20000);
  const [cogs, setCogs] = useState<number>(8000);
  const [trackStock, setTrackStock] = useState(false);
  const [currentStock, setCurrentStock] = useState<number>(50);
  const [minStock, setMinStock] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSku(`PRD-${Date.now().toString().slice(-4)}`);
    setBarcode(`899${Math.floor(1000000 + Math.random() * 9000000)}`);
    setCategoryId(productCategories[0]?.id || categories[0]?.id || '');
    setPrice(20000);
    setCogs(8000);
    setTrackStock(false);
    setCurrentStock(50);
    setMinStock(10);
    setDescription('');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode);
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setCogs(p.cogs);
    setTrackStock(p.trackStock);
    setCurrentStock(p.currentStock);
    setMinStock(p.minStock);
    setDescription(p.description || '');
    setActive(p.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cat = categories.find(c => c.id === categoryId) || categories[0];

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name,
        sku,
        barcode,
        categoryId: cat.id,
        categoryName: cat.name,
        price,
        cogs,
        trackStock,
        currentStock,
        minStock,
        description,
        active,
      });
    } else {
      addProduct({
        name,
        sku: sku || `PRD-${Date.now().toString().slice(-4)}`,
        barcode: barcode || `899${Math.floor(1000000 + Math.random() * 9000000)}`,
        categoryId: cat.id,
        categoryName: cat.name,
        price,
        cogs,
        hasRecipe: false,
        recipe: [],
        directLaborCost: 0,
        overheads: [],
        targetMarginPercent: 50,
        suggestedPrice: price,
        trackStock,
        currentStock,
        minStock,
        description,
        active,
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Katalog Menu & Produk
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh menu jual, harga, status resep HPP, dan manajemen produk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className="px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            title="Kelola Kategori di Menu Pengaturan"
          >
            ⚙ Kelola Kategori
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama menu, SKU, atau barcode..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua ({products.length})
          </button>
          {productCategories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-4 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Menu & Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">HPP (Modal)</th>
                <th className="py-3 px-4 text-right">Gross Margin</th>
                <th className="py-3 px-4">Formula Resep (BOM)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map(p => {
                const margin = calculateGrossMarginPercent(p.price, p.cogs);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 text-sm">{p.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                        <span>SKU: {p.sku}</span>
                        <span>·</span>
                        <span>Barcode: {p.barcode}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-neutral-600">
                      {p.categoryName}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-neutral-900 font-mono tabular-nums text-sm">
                      {formatRupiah(p.price)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-700">
                      {formatRupiah(p.cogs)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span className={`font-semibold ${margin >= 45 ? 'text-emerald-700' : 'text-neutral-700'}`}>
                        {margin}%
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {p.hasRecipe && p.recipe && p.recipe.length > 0 ? (
                        <button
                          onClick={() => setActiveTab('hpp_calculator')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[10px] font-semibold hover:bg-neutral-200 transition-colors"
                          title="Lihat formula resep di Kalkulator HPP"
                        >
                          <Calculator className="w-3 h-3 text-neutral-600" />
                          <span>{p.recipe.length} Bahan Baku</span>
                        </button>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">Non-Resep / Manual</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => updateProduct({ ...p, active: !p.active })}
                        className="inline-flex items-center"
                        title={p.active ? 'Nonaktifkan Produk' : 'Aktifkan Produk'}
                      >
                        {p.active ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-500">
                            Nonaktif
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setActiveTab('hpp_calculator')}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Buka di Kalkulator HPP"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Edit Produk"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus produk "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Produk"
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

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-neutral-200 relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">
                {editingProduct ? 'Edit Informasi Menu' : 'Tambah Menu Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nama Menu / Produk:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kopi Caramel Machiatto"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-neutral-700">Kategori:</label>
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
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white font-semibold text-slate-800"
                  >
                    {productCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    {!productCategories.some(c => c.id === categoryId) && categories.find(c => c.id === categoryId) && (
                      <option value={categoryId}>{categories.find(c => c.id === categoryId)?.name}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Kode SKU:</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PRD-01"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono tabular-nums text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">HPP / Biaya Modal (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={cogs}
                    onChange={(e) => setCogs(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Kode Barcode:</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="899..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Deskripsi Singkat:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan rasa, komposisi..."
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

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
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
