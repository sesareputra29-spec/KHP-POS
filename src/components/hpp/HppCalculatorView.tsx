import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Save 
} from 'lucide-react';
import { RecipeItem, OverheadCost } from '../../types';
import { 
  formatRupiah, 
  calculatePriceFromMargin, 
  calculateGrossMarginPercent, 
  calculateMarkupPercent, 
  calculateBEP 
} from '../../utils/formatters';

export const HppCalculatorView: React.FC = () => {
  const { 
    products, 
    ingredients, 
    categories, 
    applyHppToProduct, 
    addProduct, 
    settings,
    setActiveTab 
  } = useApp();

  // Mode: edit existing product recipe OR create a brand new product from recipe
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'new');
  const [productName, setProductName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [sku, setSku] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');

  // Recipe & Costing State
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [directLaborCost, setDirectLaborCost] = useState<number>(1000);
  const [overheads, setOverheads] = useState<OverheadCost[]>([
    { id: 'ovh-1', name: 'Listrik & Gas Operasional', amount: 500 },
    { id: 'ovh-2', name: 'Packaging & Tissue', amount: 350 },
  ]);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(50);
  const [actualPrice, setActualPrice] = useState<number>(0);
  const [successNotice, setSuccessNotice] = useState<string>('');

  // Load product data when selection changes
  useEffect(() => {
    if (selectedProductId === 'new') {
      setProductName('');
      setSku(`PRD-${Date.now().toString().slice(-4)}`);
      setBarcode(`899${Math.floor(1000000 + Math.random() * 9000000)}`);
      setRecipeItems([]);
      setDirectLaborCost(1000);
      setOverheads([
        { id: 'ovh-1', name: 'Listrik & Gas Operasional', amount: 500 },
        { id: 'ovh-2', name: 'Packaging & Tissue', amount: 350 },
      ]);
      setTargetMarginPercent(50);
      setActualPrice(0);
    } else {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) {
        setProductName(prod.name);
        setCategoryId(prod.categoryId);
        setSku(prod.sku);
        setBarcode(prod.barcode);
        setRecipeItems(prod.recipe || []);
        setDirectLaborCost(prod.directLaborCost || 0);
        setOverheads(prod.overheads || []);
        setTargetMarginPercent(prod.targetMarginPercent || 50);
        setActualPrice(prod.price || 0);
      }
    }
  }, [selectedProductId, products]);

  // Recalculate raw material cost
  const rawMaterialsCost = recipeItems.reduce((sum, item) => sum + item.costCalculated, 0);
  const totalOverheadCost = overheads.reduce((sum, item) => sum + item.amount, 0);
  const totalCogs = rawMaterialsCost + directLaborCost + totalOverheadCost;

  const suggestedPrice = calculatePriceFromMargin(totalCogs, targetMarginPercent);
  const effectivePrice = actualPrice > 0 ? actualPrice : suggestedPrice;
  const currentGrossProfit = effectivePrice - totalCogs;
  const realizedMargin = calculateGrossMarginPercent(effectivePrice, totalCogs);
  const realizedMarkup = calculateMarkupPercent(effectivePrice, totalCogs);

  // BEP Calculation based on monthly fixed overhead in settings
  const bep = calculateBEP(settings.fixedMonthlyOverhead || 8000000, effectivePrice, totalCogs);

  // Handlers for Recipe Table
  const handleAddIngredientRow = () => {
    if (ingredients.length === 0) return;
    const defaultIng = ingredients[0];
    const defaultQty = defaultIng.unit === 'gr' ? 10 : defaultIng.unit === 'ml' ? 50 : 1;
    setRecipeItems(prev => [
      ...prev,
      {
        ingredientId: defaultIng.id,
        ingredientName: defaultIng.name,
        quantity: defaultQty,
        unit: defaultIng.unit,
        costCalculated: defaultQty * defaultIng.costPerUnit,
      }
    ]);
  };

  const handleUpdateIngredientRow = (index: number, ingredientId: string, quantity: number) => {
    const ing = ingredients.find(i => i.id === ingredientId);
    if (!ing) return;

    setRecipeItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const qty = Math.max(0, quantity);
        return {
          ingredientId: ing.id,
          ingredientName: ing.name,
          quantity: qty,
          unit: ing.unit,
          costCalculated: Math.round(qty * ing.costPerUnit),
        };
      }
      return item;
    }));
  };

  const handleRemoveIngredientRow = (index: number) => {
    setRecipeItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Handlers for Overheads
  const handleAddOverhead = () => {
    setOverheads(prev => [
      ...prev,
      { id: `ovh-${Date.now()}`, name: 'Biaya Tambahan', amount: 500 }
    ]);
  };

  const handleUpdateOverhead = (id: string, name: string, amount: number) => {
    setOverheads(prev => prev.map(o => o.id === id ? { ...o, name, amount: Math.max(0, amount) } : o));
  };

  const handleRemoveOverhead = (id: string) => {
    setOverheads(prev => prev.filter(o => o.id !== id));
  };

  // Apply to Product Catalog / Save
  const handleSaveAndApply = () => {
    if (!productName.trim()) {
      alert('Silakan masukkan nama produk/menu terlebih dahulu!');
      return;
    }

    const finalPrice = actualPrice > 0 ? actualPrice : suggestedPrice;

    if (selectedProductId === 'new') {
      const selectedCat = categories.find(c => c.id === categoryId) || categories[0];
      addProduct({
        name: productName,
        sku: sku || `PRD-${Date.now().toString().slice(-4)}`,
        barcode: barcode || `899${Math.floor(1000000 + Math.random() * 9000000)}`,
        categoryId: selectedCat?.id || 'cat-1',
        categoryName: selectedCat?.name || 'Umum',
        price: finalPrice,
        hasRecipe: recipeItems.length > 0,
        recipe: recipeItems,
        directLaborCost,
        overheads,
        cogs: totalCogs,
        targetMarginPercent,
        suggestedPrice,
        trackStock: recipeItems.length === 0,
        currentStock: 50,
        minStock: 10,
        active: true,
      });
      setSuccessNotice(`Produk baru "${productName}" berhasil dibuat dan disimpan ke katalog POS!`);
    } else {
      applyHppToProduct(selectedProductId, {
        recipe: recipeItems,
        directLaborCost,
        overheads,
        cogs: totalCogs,
        targetMarginPercent,
        suggestedPrice,
        price: finalPrice,
      });
      setSuccessNotice(`Formula HPP & Resep untuk "${productName}" berhasil diperbarui!`);
    }

    setTimeout(() => setSuccessNotice(''), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Kalkulator HPP & Costing Resep (BOM)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hitung biaya bahan baku per takaran saji, upah langsung, dan overhead untuk menentukan harga jual ideal.
          </p>
        </div>

        {/* Product Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
            Pilih Menu:
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs text-slate-800"
          >
            <option value="new">+ Buat Resep Produk Baru</option>
            <optgroup label="Produk Menu Terdaftar:">
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatRupiah(p.price)})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
          <button 
            onClick={() => setActiveTab('pos')}
            className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold text-[11px]"
          >
            Buka Kasir POS
          </button>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        {/* LEFT COLUMN: RECIPE & INGREDIENTS BILL OF MATERIALS (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Product Basic Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">1. Informasi Menu / Produk</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">Nama Produk / Menu:</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Kopi Susu Aren Spesial"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Kategori:</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  {categories.filter(c => c.type === 'product' || c.type === 'general' || !c.type).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Kode SKU:</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="PRD-01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">Kode Barcode:</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="899..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bill of Materials (Bahan Baku) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">2. Komposisi Bahan Baku (BOM / Recipe)</h3>
                <p className="text-[11px] text-slate-500">
                  Daftar takaran bahan yang digunakan per 1 porsi saji.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredientRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Bahan</span>
              </button>
            </div>

            {recipeItems.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50/50">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
                <p className="text-xs font-bold text-slate-700">Belum ada bahan baku dalam resep ini.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik tombol "+ Tambah Bahan" di atas untuk memasukkan komposisi resep.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Bahan Baku</th>
                      <th className="py-2.5 px-3 w-32">Takaran</th>
                      <th className="py-2.5 px-3 text-right">Biaya Satuan</th>
                      <th className="py-2.5 px-3 text-right">Subtotal Biaya</th>
                      <th className="py-2.5 px-2 text-center w-10">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recipeItems.map((item, idx) => {
                      const ing = ingredients.find(i => i.id === item.ingredientId);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3">
                            <select
                              value={item.ingredientId}
                              onChange={(e) => handleUpdateIngredientRow(idx, e.target.value, item.quantity)}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium text-slate-900"
                            >
                              {ingredients.map(i => (
                                <option key={i.id} value={i.id}>
                                  {i.name} (Stok: {i.currentStock} {i.unit})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0.1"
                                step="any"
                                value={item.quantity}
                                onChange={(e) => handleUpdateIngredientRow(idx, item.ingredientId, parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono tabular-nums text-center font-bold"
                              />
                              <span className="text-slate-500 font-mono text-[11px] font-semibold">{item.unit}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-right text-slate-500 font-mono tabular-nums">
                            {formatRupiah(ing ? ing.costPerUnit : 0)} / {item.unit}
                          </td>

                          <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 font-mono tabular-nums">
                            {formatRupiah(item.costCalculated)}
                          </td>

                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleRemoveIngredientRow(idx)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                      <td colSpan={3} className="py-2.5 px-3 text-slate-700">
                        Total Biaya Bahan Baku:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-800 text-sm font-extrabold">
                        {formatRupiah(rawMaterialsCost)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Direct Labor & Operational Overheads */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">3. Tenaga Kerja Langsung & Biaya Overhead</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Direct Labor */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-slate-800 font-bold mb-1">
                  Biaya Tenaga Kerja Langsung per Porsi:
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Upah barista / juru masak untuk membuat 1 menu.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={directLaborCost}
                    onChange={(e) => setDirectLaborCost(Number(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono tabular-nums text-slate-900"
                  />
                </div>
              </div>

              {/* Overheads List */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">Biaya Overhead per Porsi:</span>
                  <button
                    type="button"
                    onClick={handleAddOverhead}
                    className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Tambah
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {overheads.map(ovh => (
                    <div key={ovh.id} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={ovh.name}
                        onChange={(e) => handleUpdateOverhead(ovh.id, e.target.value, ovh.amount)}
                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1 text-[10px] text-slate-400">Rp</span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={ovh.amount}
                          onChange={(e) => handleUpdateOverhead(ovh.id, ovh.name, Number(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono tabular-nums text-right font-bold"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveOverhead(ovh.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                  <span>Total Overhead:</span>
                  <span className="font-mono tabular-nums text-emerald-700">{formatRupiah(totalOverheadCost)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HPP SUMMARY, MARGIN TARGET, PRICING & BEP (1 Col) */}
        <div className="space-y-5">
          {/* Card: Total HPP Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Ringkasan Total HPP (COGS)</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Biaya Bahan Baku:</span>
                <span className="font-mono tabular-nums font-semibold">{formatRupiah(rawMaterialsCost)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tenaga Kerja Langsung:</span>
                <span className="font-mono tabular-nums font-semibold">{formatRupiah(directLaborCost)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Overhead & Operasional:</span>
                <span className="font-mono tabular-nums font-semibold">{formatRupiah(totalOverheadCost)}</span>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-900">Total HPP Modal / Porsi:</span>
                <span className="text-xl font-extrabold font-mono tabular-nums text-emerald-800">
                  {formatRupiah(totalCogs)}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Target Profit Margin & Suggested Price */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Target Margin Keuntungan:
                </label>
                <span className="text-sm font-extrabold font-mono text-emerald-700 tabular-nums">
                  {targetMarginPercent}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="5"
                value={targetMarginPercent}
                onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>10% (Tipis)</span>
                <span>50% (Standar)</span>
                <span>85% (Tinggi)</span>
              </div>
            </div>

            {/* Suggested Price Display */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-bold">Rekomendasi Harga Jual:</span>
              <div className="text-xl font-extrabold font-mono tabular-nums text-emerald-950 mt-0.5">
                {formatRupiah(suggestedPrice)}
              </div>
              <p className="text-[10px] text-emerald-700 mt-1">
                Formula: HPP / (1 - Margin) dibulatkan ke kelipatan Rp 500 terdekat.
              </p>
            </div>

            {/* Actual Selling Price Input */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Harga Jual di Menu Kasir (Rp):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={actualPrice || ''}
                  onChange={(e) => setActualPrice(Number(e.target.value) || 0)}
                  placeholder={suggestedPrice.toString()}
                  className="w-full pl-9 pr-3 py-2 text-base font-extrabold font-mono tabular-nums border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Profit Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold">Laba Kotor / Porsi</span>
                <p className="text-sm font-extrabold font-mono tabular-nums text-emerald-900 mt-0.5">
                  {formatRupiah(currentGrossProfit)}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold">Gross Margin</span>
                <p className="text-sm font-extrabold font-mono tabular-nums text-emerald-900 mt-0.5">
                  {realizedMargin}% ({realizedMarkup}% Markup)
                </p>
              </div>
            </div>

            {/* Save & Apply Action Button */}
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Terapkan ke Menu POS Sekarang</span>
            </button>
          </div>

          {/* Card: Break-Even Point (BEP) Analysis */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Analisis Titik Impas (BEP)
              </h4>
            </div>

            <p className="text-xs text-slate-500">
              Berdasarkan estimasi biaya operasional bulanan ({formatRupiah(settings.fixedMonthlyOverhead || 8500000)}), target minimal untuk balik modal:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Target BEP Kuantitas</span>
                <p className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                  {bep.bepUnits} Porsi / bln
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  (~{Math.ceil(bep.bepUnits / 30)} porsi/hari)
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Target BEP Omset</span>
                <p className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                  {formatRupiah(bep.bepRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
