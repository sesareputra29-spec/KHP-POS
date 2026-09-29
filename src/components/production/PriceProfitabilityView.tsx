import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Search, 
  Percent, 
  ArrowUpRight, 
  Layers, 
  Check, 
  Edit2 
} from 'lucide-react';
import { formatRupiah, calculateGrossMarginPercent, calculateMarkupPercent } from '../../utils/formatters';

export const PriceProfitabilityView: React.FC = () => {
  const { products, updateProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const handleStartEdit = (id: string, currentPrice: number) => {
    setEditingPriceId(id);
    setTempPrice(currentPrice);
  };

  const handleSavePrice = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    updateProduct({
      ...prod,
      price: tempPrice,
    });
    setEditingPriceId(null);
  };

  const filtered = products.filter(p => {
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
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Harga Jual & Analisis Profitabilitas
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Matriks evaluasi margin keuntungan (Gross Margin), markup laba, dan estimasi kontribusi profit per produk.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu untuk analisis margin..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Table Matriks Profitabilitas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Menu & Produk</th>
                <th className="py-3 px-4 text-right">Biaya HPP Modal</th>
                <th className="py-3 px-4 text-right">Harga Jual Saat Ini</th>
                <th className="py-3 px-4 text-right">Laba Kotor (Rp)</th>
                <th className="py-3 px-4 text-right">Gross Margin %</th>
                <th className="py-3 px-4 text-right">Markup %</th>
                <th className="py-3 px-4 text-center">Status Keuntungan</th>
                <th className="py-3 px-4 text-center w-28">Ubah Harga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => {
                const isEditing = editingPriceId === p.id;
                const activePrice = isEditing ? tempPrice : p.price;
                const profit = activePrice - p.cogs;
                const margin = calculateGrossMarginPercent(activePrice, p.cogs);
                const markup = calculateMarkupPercent(activePrice, p.cogs);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.categoryName} · SKU: {p.sku}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700 tabular-nums">
                      {formatRupiah(p.cogs)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-emerald-500 rounded-lg text-xs font-mono font-bold text-right"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePrice(p.id)}
                            className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-extrabold text-sm font-mono text-slate-900 tabular-nums">
                          {formatRupiah(p.price)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800 tabular-nums">
                      {formatRupiah(profit)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span className={`font-bold px-2 py-0.5 rounded-md ${
                        margin >= 50 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : margin >= 30 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {margin}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                      {markup}%
                    </td>

                    <td className="py-3 px-4 text-center">
                      {margin >= 50 ? (
                        <span className="text-[11px] font-bold text-emerald-700">Tinggi (Optimal)</span>
                      ) : margin >= 30 ? (
                        <span className="text-[11px] font-bold text-blue-700">Sehat (Standar)</span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700">Tipis</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(p.id, p.price)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Atur Harga
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
