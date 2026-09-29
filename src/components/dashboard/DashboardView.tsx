import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Boxes, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Receipt, 
  Calculator, 
  Factory, 
  PackagePlus,
  Users,
  ChevronRight
} from 'lucide-react';
import { formatRupiah, formatDateTime } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const { 
    transactions, 
    products, 
    ingredients, 
    currentShift, 
    setActiveTab, 
    setReceiptModalTransaction,
    settings,
    currentUser,
    lowStockItemsCount,
    customers
  } = useApp();

  // Calculate today's metrics
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const todayTransactions = transactions.filter(t => t.timestamp >= startOfToday && t.status === 'completed');
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const todayCogs = todayTransactions.reduce((sum, t) => sum + t.totalCogs, 0);
  const todayGrossProfit = todayRevenue - todayCogs;

  const lowIngredients = ingredients.filter(i => i.currentStock <= i.minStock);

  // Daily target benchmark (SaaS Progress Tracker)
  const dailyTarget = 2500000;
  const targetPercent = Math.min(100, Math.round((todayRevenue / dailyTarget) * 100));

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/60 p-4 sm:p-6 select-none space-y-5">
      {/* Top Banner & Quick Action Greeting */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 font-medium">
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              SaaS Overview
            </span>
            <span aria-hidden="true">·</span>
            <span>{settings.storeName}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Sistem Siap Operasi
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, {currentUser.name}!
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Ringkasan omset penjualan, rasio food-cost HPP, laci kasir kas, dan persediaan bahan resep hari ini.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('pos')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Buka POS / Kasir</span>
          </button>
          <button
            onClick={() => setActiveTab('hpp_calculator')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Calculator className="w-4 h-4 text-slate-600" />
            <span>Hitung HPP</span>
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Factory className="w-4 h-4 text-slate-600" />
            <span>Produksi</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Omset Hari Ini */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">Penjualan Hari Ini</span>
              <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                {todayTransactions.length} Struk
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1 tracking-tight">
              {formatRupiah(todayRevenue)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Rata-rata order:</span>
            <span className="font-mono font-bold text-slate-700 tabular-nums">
              {formatRupiah(todayTransactions.length > 0 ? Math.round(todayRevenue / todayTransactions.length) : 0)}
            </span>
          </div>
        </div>

        {/* Laba Kotor Hari Ini */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">Laba Kotor</span>
              <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {todayRevenue > 0 ? Math.round((todayGrossProfit / todayRevenue) * 100) : 0}% Margin
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-emerald-700 mt-1 tracking-tight">
              {formatRupiah(todayGrossProfit)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>HPP Modal:</span>
            <span className="font-mono font-semibold text-slate-700 tabular-nums">{formatRupiah(todayCogs)}</span>
          </div>
        </div>

        {/* Shift Kasir Aktif */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">Laci Kasir</span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${currentShift ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-[10px] font-medium text-slate-500">{currentShift ? 'Aktif' : 'Tutup'}</span>
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1 tracking-tight">
              {currentShift ? formatRupiah(currentShift.expectedCash) : 'Rp 0'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            {currentShift ? `Kasir: ${currentShift.cashierName}` : 'Buka shift kasir baru'}
          </div>
        </div>

        {/* Status Stok Kritis */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">Stok Kritis</span>
              <AlertTriangle className={`w-3.5 h-3.5 ${lowStockItemsCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            </div>
            <div className={`text-xl sm:text-2xl font-extrabold font-mono tabular-nums mt-1 tracking-tight ${
              lowStockItemsCount > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}>
              {lowStockItemsCount} Item
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            {lowStockItemsCount > 0 ? 'Perlu kulakan bahan baku' : 'Semua stok aman'}
          </div>
        </div>
      </div>

      {/* SaaS Benchmark Progress Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Pencapaian Target Penjualan Harian</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {formatRupiah(todayRevenue)} / {formatRupiah(dailyTarget)} ({targetPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
        </div>
        <div className="shrink-0 text-[11px] text-slate-500 border-l sm:border-slate-200 sm:pl-4">
          Status: <span className="font-semibold text-emerald-700">{targetPercent >= 100 ? 'Target Terpenuhi 🎉' : 'On Track'}</span>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Quick Menu Access & Recent Sales */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Module Shortcuts Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">Modul & Akses Cepat</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <button
                onClick={() => setActiveTab('master_products')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-slate-50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-900">Master Menu</div>
                <div className="text-[11px] text-slate-500">{products.length} Menu Terdaftar</div>
              </button>

              <button
                onClick={() => setActiveTab('bom_recipe')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-slate-50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                  <Calculator className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-900">BOM & Resep</div>
                <div className="text-[11px] text-slate-500">Formula HPP Porsi</div>
              </button>

              <button
                onClick={() => setActiveTab('inventory_stock')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-slate-50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                  <Boxes className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-900">Stok Bahan</div>
                <div className="text-[11px] text-slate-500">{ingredients.length} Bahan Baku</div>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-slate-50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-900">Laporan Laba Rugi</div>
                <div className="text-[11px] text-slate-500">Analisis Keuangan</div>
              </button>
            </div>
          </div>

          {/* Recent POS Transactions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Transaksi Terakhir Hari Ini</h3>
              <button
                onClick={() => setActiveTab('transaction_history')}
                className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {transactions.slice(0, 5).map(trx => (
                <div
                  key={trx.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{trx.invoiceNumber}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {formatDateTime(trx.timestamp)} · {trx.paymentMethod.toUpperCase()} · Kasir: {trx.cashierName}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-extrabold font-mono tabular-nums text-slate-900">
                        {formatRupiah(trx.total)}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-700 font-bold">
                        Laba: {formatRupiah(trx.grossProfit)}
                      </div>
                    </div>

                    <button
                      onClick={() => setReceiptModalTransaction(trx)}
                      className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                      title="Lihat / Cetak Struk"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Low Stock Alerts & Top Customers */}
        <div className="space-y-5">
          {/* Low Stock Warning Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Bahan Baku Menipis</h3>
              </div>
              <button
                onClick={() => setActiveTab('purchases')}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                + Restock PO
              </button>
            </div>

            {lowIngredients.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Semua bahan baku memiliki stok aman.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {lowIngredients.slice(0, 5).map(ing => (
                  <div key={ing.id} className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-amber-950 truncate max-w-[150px]">{ing.name}</div>
                      <div className="text-[10px] text-amber-800 font-mono">Min: {ing.minStock} {ing.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-amber-900 font-mono tabular-nums">
                        {ing.currentStock} {ing.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Customers Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <h3 className="font-extrabold text-slate-900 text-sm">Pelanggan Aktif</h3>
              </div>
              <button
                onClick={() => setActiveTab('customers')}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {customers.slice(0, 4).map(cust => (
                <div key={cust.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{cust.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{cust.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-700 font-mono tabular-nums">
                      {formatRupiah(cust.totalSpent)}
                    </div>
                    {cust.outstandingCredit > 0 && (
                      <div className="text-[10px] font-mono text-red-600 font-bold">
                        Tempo: {formatRupiah(cust.outstandingCredit)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
