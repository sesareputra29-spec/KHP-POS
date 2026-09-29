import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChefHat, 
  Plus, 
  Search, 
  Calculator, 
  Layers, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { formatRupiah, calculateGrossMarginPercent } from '../../utils/formatters';

export const BomRecipeView: React.FC = () => {
  const { products, setActiveTab, ingredients } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ChefHat className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              BOM (Bill of Materials) & Formula Resep
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar komposisi resep bahan baku per 1 porsi saji, biaya bahan, dan kalkulasi HPP menu.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('hpp_calculator')}
          className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat / Edit Resep di HPP</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-4 max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari formula resep menu..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Grid of BOM Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {filtered.map(prod => {
          const rawMaterialCost = prod.recipe ? prod.recipe.reduce((sum, r) => sum + r.costCalculated, 0) : 0;
          const margin = calculateGrossMarginPercent(prod.price, prod.cogs);

          return (
            <div 
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{prod.categoryName}</span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">{prod.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{prod.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {margin}% Margin
                    </span>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-1">
                      {formatRupiah(prod.price)}
                    </div>
                  </div>
                </div>

                {/* Recipe Ingredients List */}
                <div className="py-3">
                  <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span>Komposisi Bahan Saji:</span>
                    <span className="text-slate-400 font-normal">
                      {prod.recipe && prod.recipe.length > 0 ? `${prod.recipe.length} bahan` : 'Non-Resep'}
                    </span>
                  </div>

                  {prod.hasRecipe && prod.recipe && prod.recipe.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {prod.recipe.map((item, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{item.ingredientName}</span>
                            <span className="text-slate-400 text-[10px] ml-1">({item.quantity} {item.unit})</span>
                          </div>
                          <span className="font-mono font-semibold text-slate-700 tabular-nums">
                            {formatRupiah(item.costCalculated)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Menu ini belum memiliki formula resep BOM.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Summary & Link to HPP Calculator */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Total HPP Modal:</span>
                  <span className="font-extrabold font-mono text-emerald-800 tabular-nums">{formatRupiah(prod.cogs)}</span>
                </div>

                <button
                  onClick={() => setActiveTab('hpp_calculator')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5 text-slate-600" />
                  <span>Kalkulasi Ulang di HPP</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
