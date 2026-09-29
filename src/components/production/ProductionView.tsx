import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Factory, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  FileText 
} from 'lucide-react';
import { formatRupiah, formatDateTime, formatNumber } from '../../utils/formatters';

export const ProductionView: React.FC = () => {
  const { 
    products, 
    ingredients, 
    productionBatches, 
    recordProductionBatch 
  } = useApp();

  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantityProduced, setQuantityProduced] = useState<number>(20);
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');

  const selectedProduct = products.find(p => p.id === productId);

  const handleProduce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantityProduced <= 0) return;

    const success = recordProductionBatch({
      productId,
      quantityProduced,
      notes: notes || `Batch produksi ${quantityProduced}x ${selectedProduct.name}`,
    });

    if (success) {
      setNotice(`Batch produksi ${quantityProduced}x "${selectedProduct.name}" berhasil dicatat! Stok bahan baku telah otomatis terpotong.`);
      setNotes('');
      setTimeout(() => setNotice(''), 4000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Factory className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Manajemen Batch Produksi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catat hasil peracikan dan produksi menu dalam batch, konversikan bahan baku mentah menjadi stok produk siap jual.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left (1 Col): Form Input Batch Produksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Catat Batch Produksi Baru</span>
          </h3>

          <form onSubmit={handleProduce} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Menu / Produk Jadi:</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white font-semibold text-slate-900"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (HPP: {formatRupiah(p.cogs)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Porsi yang Dihasilkan:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantityProduced}
                  onChange={(e) => setQuantityProduced(Number(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono tabular-nums text-base font-bold text-slate-900"
                />
                <span className="font-bold text-slate-500">Porsi / Cup</span>
              </div>
            </div>

            {/* Estimated Ingredients Required Preview */}
            {selectedProduct && selectedProduct.recipe && selectedProduct.recipe.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-700 text-[11px] mb-1">
                  Bahan Baku yang Akan Terpotong Otomatis:
                </div>
                {selectedProduct.recipe.map((r, idx) => {
                  const requiredQty = r.quantity * quantityProduced;
                  const ing = ingredients.find(i => i.id === r.ingredientId);
                  const isShortage = ing ? ing.currentStock < requiredQty : false;

                  return (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="text-slate-600 truncate pr-1">{r.ingredientName}:</span>
                      <span className={`font-mono tabular-nums font-bold ${isShortage ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatNumber(requiredQty)} {r.unit} {isShortage && '(Stok Kurang!)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Batch / Shift Dapur:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Produksi es kopi 5 liter untuk stok sore..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Total Batch Cost */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex justify-between items-center">
              <span className="text-emerald-800 font-bold">Total Nilai HPP Batch:</span>
              <span className="font-extrabold font-mono text-emerald-950 text-sm tabular-nums">
                {formatRupiah((selectedProduct?.cogs || 0) * quantityProduced)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              Proses & Potong Stok Bahan
            </button>
          </form>
        </div>

        {/* Right (2 Cols): History of Production Batches */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">Riwayat Batch Produksi</h3>
            <span className="text-xs text-slate-400 font-mono">
              Total {productionBatches.length} batch tercatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Batch & Tanggal</th>
                  <th className="py-3 px-4">Menu Dihasilkan</th>
                  <th className="py-3 px-4 text-center">Jumlah Porsi</th>
                  <th className="py-3 px-4 text-right">Total Biaya HPP</th>
                  <th className="py-3 px-4">Petugas / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productionBatches.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">{b.batchNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{formatDateTime(b.timestamp)}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {b.productName}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-emerald-800 tabular-nums">
                      +{b.quantityProduced} porsi
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 tabular-nums">
                      {formatRupiah(b.totalCogs)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{b.staffName}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{b.notes || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
