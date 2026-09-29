import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LineChart, 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  Target, 
  Sparkles,
  PieChart,
  ArrowRight
} from 'lucide-react';
import { formatRupiah, formatNumber } from '../../utils/formatters';

export const AnalysisSimulationView: React.FC = () => {
  const { products, ingredients, transactions } = useApp();

  // Tab switch between BEP & Sensitivity
  const [activeTabSub, setActiveTabSub] = useState<'bep' | 'sensitivity' | 'matrix'>('bep');

  // BEP State
  const [fixedCosts, setFixedCosts] = useState<number>(6500000); // 6.5 Juta (Sewa + Listrik + Gaji Pokok)
  const [operatingDays, setOperatingDays] = useState<number>(30);

  // Compute average product price and COGS
  const validProducts = products.filter(p => p.price > 0);
  const avgSellingPrice = validProducts.length > 0 
    ? validProducts.reduce((sum, p) => sum + p.price, 0) / validProducts.length 
    : 25000;

  const avgCogs = validProducts.length > 0 
    ? validProducts.reduce((sum, p) => sum + (p.cogs || p.price * 0.4), 0) / validProducts.length 
    : 10000;

  const [simAvgPrice, setSimAvgPrice] = useState<number>(Math.round(avgSellingPrice));
  const [simAvgCogs, setSimAvgCogs] = useState<number>(Math.round(avgCogs));

  // BEP Calculation
  const contributionMarginPerUnit = Math.max(1, simAvgPrice - simAvgCogs);
  const contributionMarginRatio = contributionMarginPerUnit / simAvgPrice;

  const bepUnitsMonthly = Math.ceil(fixedCosts / contributionMarginPerUnit);
  const bepUnitsDaily = Math.ceil(bepUnitsMonthly / operatingDays);
  const bepRevenueMonthly = Math.round(fixedCosts / contributionMarginRatio);
  const bepRevenueDaily = Math.round(bepRevenueMonthly / operatingDays);

  // Sensitivity State
  const [ingredientInflation, setIngredientInflation] = useState<number>(15); // +15% inflation
  const [selectedProductSimId, setSelectedProductSimId] = useState<string>(products[0]?.id || '');

  const selectedProduct = products.find(p => p.id === selectedProductSimId) || products[0];

  const currentCogs = selectedProduct?.cogs || 12000;
  const simulatedCogs = Math.round(currentCogs * (1 + ingredientInflation / 100));
  const currentMargin = selectedProduct?.price > 0 
    ? ((selectedProduct.price - currentCogs) / selectedProduct.price) * 100 
    : 50;
  const erodedMargin = selectedProduct?.price > 0 
    ? ((selectedProduct.price - simulatedCogs) / selectedProduct.price) * 100 
    : 35;
  const recommendedNewPrice = Math.round(simulatedCogs / (1 - (currentMargin / 100)));

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Analisis Keuangan & Simulasi HPP
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              KHP Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulasi Break-Even Point (BEP), uji sensitivitas kenaikan harga bahan baku, dan matriks rekayasa menu.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            onClick={() => setActiveTabSub('bep')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTabSub === 'bep' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Kalkulator BEP
          </button>
          <button
            onClick={() => setActiveTabSub('sensitivity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTabSub === 'sensitivity' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Simulasi Inflasi Bahan
          </button>
          <button
            onClick={() => setActiveTabSub('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTabSub === 'matrix' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Matriks Menu
          </button>
        </div>
      </div>

      {activeTabSub === 'bep' && (
        <div className="space-y-4">
          {/* BEP Formula Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Simulasi Titik Impas (Break-Even Point)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Hitung berapa porsi menu atau omset minimum yang wajib dicapai agar toko tidak merugi dan menutup semua beban operasional tetap.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Biaya Tetap Bulanan (Rp)
                </label>
                <input
                  type="number"
                  step="500000"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Sewa, gaji pokok, WiFi, listrik</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Rata-rata Harga Jual Menu (Rp)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={simAvgPrice}
                  onChange={(e) => setSimAvgPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Harga rata-rata seporsi</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Rata-rata HPP Modal / Porsi (Rp)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={simAvgCogs}
                  onChange={(e) => setSimAvgCogs(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Biaya modal bahan & cup</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Hari Operasional / Bulan
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={operatingDays}
                  onChange={(e) => setOperatingDays(parseInt(e.target.value) || 30)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Hari aktif berjualan</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-slate-400 mb-1">BEP Target Harian (Porsi)</div>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                {formatNumber(bepUnitsDaily)} Porsi / Hari
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Harus terjual minimal setiap hari kerja
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-slate-400 mb-1">BEP Target Harian (Omset)</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {formatRupiah(bepRevenueDaily)} / Hari
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Target omset kasir per hari
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-slate-400 mb-1">BEP Target Bulanan (Porsi)</div>
              <div className="text-2xl font-extrabold text-blue-600 font-mono">
                {formatNumber(bepUnitsMonthly)} Porsi
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Total penjualan impas selama {operatingDays} hari
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-slate-400 mb-1">BEP Target Bulanan (Omset)</div>
              <div className="text-2xl font-extrabold text-purple-600 font-mono">
                {formatRupiah(bepRevenueMonthly)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Margin Kontribusi: {(contributionMarginRatio * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTabSub === 'sensitivity' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Simulasi Sensitivitas Kenaikan Harga Bahan Baku</span>
              </h3>
              <p className="text-xs text-slate-500">
                Lihat dampak langsung jika terjadi lonjakan harga bahan baku supplier terhadap keuntungan toko.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Pilih Produk Menu</label>
                <select
                  value={selectedProductSimId}
                  onChange={(e) => setSelectedProductSimId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - Harga: {formatRupiah(p.price)}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Persentase Kenaikan Harga Bahan:</span>
                  <span className="font-mono text-emerald-600 text-sm">+{ingredientInflation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={ingredientInflation}
                  onChange={(e) => setIngredientInflation(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Normal (0%)</span>
                  <span>+25%</span>
                  <span>+50%</span>
                  <span>Ekstrem (+100%)</span>
                </div>
              </div>
            </div>

            {/* Impact Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">HPP Modal Saat Ini</div>
                <div className="font-mono font-bold text-base text-slate-800 mt-1">
                  {formatRupiah(currentCogs)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Margin Saat Ini: <strong className="text-emerald-600">{currentMargin.toFixed(1)}%</strong>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-[10px] uppercase font-bold text-amber-700">HPP Setelah Kenaikan (+{ingredientInflation}%)</div>
                <div className="font-mono font-bold text-base text-amber-950 mt-1">
                  {formatRupiah(simulatedCogs)}
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Margin Terkikis Menjadi: <strong className="text-red-600">{erodedMargin.toFixed(1)}%</strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[10px] uppercase font-bold text-emerald-700">Saran Harga Jual Baru</div>
                <div className="font-mono font-bold text-base text-emerald-950 mt-1">
                  {formatRupiah(recommendedNewPrice)}
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5">
                  Agar margin tetap di <strong className="text-emerald-950">{currentMargin.toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTabSub === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Matriks Rekayasa Menu (Menu Engineering Matrix)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Klasifikasi portofolio produk berdasarkan margin laba kotor dan popularitas volume penjualan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stars */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-xs text-emerald-900 uppercase">⭐ Stars (Bintang)</span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">Margin Tinggi · Laku Keras</span>
                </div>
                <p className="text-xs text-emerald-800 mb-2">Menu terbaik! Pertahankan konsistensi rasa dan letakkan di posisi teratas daftar menu.</p>
                <div className="text-xs font-semibold text-emerald-950">
                  Contoh: Kopi Susu Gula Aren, Croissant Butter
                </div>
              </div>

              {/* Plowhorses */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-xs text-blue-900 uppercase">🐴 Plowhorses (Kuda Penarik)</span>
                  <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Margin Rendah · Laku Keras</span>
                </div>
                <p className="text-xs text-blue-800 mb-2">Sangat disukai pelanggan tapi untungnya tipis. Rekomendasi: Kurangi porsi bahan atau naikkan sedikit harga.</p>
                <div className="text-xs font-semibold text-blue-950">
                  Contoh: Es Teh Manis Jumbo, Kentang Goreng
                </div>
              </div>

              {/* Puzzles */}
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-xs text-purple-900 uppercase">🧩 Puzzles (Teka-Teki)</span>
                  <span className="text-[10px] font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded">Margin Tinggi · Penjualan Sedang</span>
                </div>
                <p className="text-xs text-purple-800 mb-2">Untung besar namun pelanggan belum banyak yang tahu. Rekomendasi: Buat paket bundling atau rekomendasikan aktif oleh kasir.</p>
                <div className="text-xs font-semibold text-purple-950">
                  Contoh: Matcha Oat Latte Signature, Steak Wagyu Meltique
                </div>
              </div>

              {/* Dogs */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-xs text-slate-800 uppercase">🐕 Dogs (Beban)</span>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Margin Rendah · Jarang Laku</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">Jarang dipesan dan margin kecil, rentan sisa bahan baku basi/rusak. Rekomendasi: Evaluasi resep atau hapus dari menu.</p>
                <div className="text-xs font-semibold text-slate-800">
                  Contoh: Menu eksperimental yang kurang populer
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
