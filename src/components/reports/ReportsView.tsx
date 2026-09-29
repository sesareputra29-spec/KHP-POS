import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Layers,
  Percent
} from 'lucide-react';
import { Transaction } from '../../types';
import { formatRupiah, formatDateTime, formatNumber } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { 
    transactions, 
    expenses, 
    setReceiptModalTransaction, 
    settings 
  } = useApp();

  const [period, setPeriod] = useState<'today' | 'yesterday' | '7days' | 'month' | 'all'>('today');

  // Filter transactions and expenses by selected period
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOf7Days = startOfToday - 86400000 * 6;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredTransactions = transactions.filter(t => {
    if (t.status === 'cancelled') return false;
    if (period === 'today') return t.timestamp >= startOfToday;
    if (period === 'yesterday') return t.timestamp >= startOfYesterday && t.timestamp < startOfToday;
    if (period === '7days') return t.timestamp >= startOf7Days;
    if (period === 'month') return t.timestamp >= startOfMonth;
    return true;
  });

  const filteredExpenses = expenses.filter(e => {
    const expTime = new Date(e.date).getTime();
    if (period === 'today') return expTime >= startOfToday;
    if (period === 'yesterday') return expTime >= startOfYesterday && expTime < startOfToday;
    if (period === '7days') return expTime >= startOf7Days;
    if (period === 'month') return expTime >= startOfMonth;
    return true;
  });

  // Financial Metrics Calculations
  const grossSales = filteredTransactions.reduce((sum, t) => sum + t.subtotal, 0);
  const totalDiscounts = filteredTransactions.reduce((sum, t) => sum + t.discountTotal, 0);
  const netSales = Math.max(0, grossSales - totalDiscounts);
  const totalCogs = filteredTransactions.reduce((sum, t) => sum + t.totalCogs, 0);
  const grossProfit = Math.max(0, netSales - totalCogs);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  
  const grossMarginPercent = netSales > 0 ? Math.round((grossProfit / netSales) * 100) : 0;
  const netMarginPercent = netSales > 0 ? Math.round((netProfit / netSales) * 100) : 0;
  const aov = filteredTransactions.length > 0 ? Math.round(netSales / filteredTransactions.length) : 0;

  // Top Selling Items
  const productSalesMap: { [id: string]: { name: string; qty: number; revenue: number; cogs: number; profit: number } } = {};
  filteredTransactions.forEach(t => {
    t.items.forEach(it => {
      if (!productSalesMap[it.productId]) {
        productSalesMap[it.productId] = { name: it.productName, qty: 0, revenue: 0, cogs: 0, profit: 0 };
      }
      productSalesMap[it.productId].qty += it.quantity;
      productSalesMap[it.productId].revenue += it.subtotal;
      productSalesMap[it.productId].cogs += it.cogs * it.quantity;
      productSalesMap[it.productId].profit += it.subtotal - (it.cogs * it.quantity);
    });
  });

  const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

  // Breakdown by Payment Method
  const paymentBreakdown: { [method: string]: number } = {
    cash: 0,
    qris: 0,
    transfer: 0,
    card: 0,
    credit: 0,
  };
  filteredTransactions.forEach(t => {
    paymentBreakdown[t.paymentMethod] = (paymentBreakdown[t.paymentMethod] || 0) + t.total;
  });

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'ID Faktur,Tanggal,Kasir,Tipe Pesanan,Pelanggan,Metode Bayar,Subtotal,Diskon,Total,HPP Modal,Laba Kotor\n';
    filteredTransactions.forEach(t => {
      csv += `"${t.invoiceNumber}","${formatDateTime(t.timestamp)}","${t.cashierName}","${t.orderType}","${t.customerName || '-'}","${t.paymentMethod}",${t.subtotal},${t.discountTotal},${t.total},${t.totalCogs},${t.grossProfit}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_KHP_POS_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Laporan Keuangan & Analisis Laba Rugi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Perhitungan real-time pendapatan, HPP modal terpakai, margin keuntungan, dan arus kas.
          </p>
        </div>

        {/* Period Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="flex p-1 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: '7days', label: '7 Hari' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'all', label: 'Semua' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  period === p.id ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 shadow-2xs transition-colors"
            title="Export CSV / Excel"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrintReport}
            className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-2xs transition-colors"
            title="Cetak Laporan"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
        {/* Penjualan Bersih */}
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Penjualan Bersih</span>
            <span className="font-mono text-[11px]">{filteredTransactions.length} Trx</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-neutral-900">
            {formatRupiah(netSales)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Rata-rata: {formatRupiah(aov)} / pesanan
          </div>
        </div>

        {/* HPP Modal Terjual */}
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>HPP Modal Terpakai</span>
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-neutral-800">
            {formatRupiah(totalCogs)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Rasio HPP: {netSales > 0 ? Math.round((totalCogs / netSales) * 100) : 0}% dari penjualan
          </div>
        </div>

        {/* Laba Kotor */}
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Laba Kotor (Gross Profit)</span>
            <span className="text-emerald-700 font-mono text-[11px] font-bold">{grossMarginPercent}% Margin</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-900">
            {formatRupiah(grossProfit)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Penjualan dikurangi biaya HPP
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Laba Bersih (Net Profit)</span>
            <span className="text-emerald-700 font-mono text-[11px] font-bold">{netMarginPercent}% Net</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-neutral-900">
            {formatRupiah(netProfit)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Setelah beban operasional ({formatRupiah(totalExpenses)})
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        {/* LEFT (2 Cols): P&L Accounting Statement & Top Products */}
        <div className="lg:col-span-2 space-y-5">
          {/* Laporan Laba Rugi Formal (Income Statement) */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <h3 className="font-bold text-neutral-900 text-sm mb-3">
              Laporan Laba Rugi (Profit & Loss Statement)
            </h3>

            <div className="divide-y divide-neutral-100 text-xs font-mono">
              <div className="py-2 flex justify-between">
                <span className="font-sans font-medium text-neutral-700">1. Penjualan Kotor (Gross Sales):</span>
                <span className="tabular-nums font-semibold">{formatRupiah(grossSales)}</span>
              </div>
              <div className="py-2 flex justify-between text-neutral-600">
                <span className="font-sans pl-3 text-neutral-500">Potongan Diskon & Promosi:</span>
                <span className="tabular-nums">-{formatRupiah(totalDiscounts)}</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold bg-neutral-50 px-2 rounded-lg text-neutral-900">
                <span className="font-sans">Penjualan Bersih (Net Revenue):</span>
                <span className="tabular-nums text-sm">{formatRupiah(netSales)}</span>
              </div>

              <div className="py-2 flex justify-between text-neutral-700">
                <span className="font-sans font-medium">2. Harga Pokok Penjualan (HPP / COGS):</span>
                <span className="tabular-nums font-semibold">-{formatRupiah(totalCogs)}</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold bg-emerald-50/70 px-2 rounded-lg text-emerald-950">
                <span className="font-sans">LABA KOTOR (GROSS PROFIT):</span>
                <span className="tabular-nums text-sm">{formatRupiah(grossProfit)}</span>
              </div>

              <div className="py-2 flex justify-between text-neutral-700">
                <span className="font-sans font-medium">3. Biaya Operasional / Kas Keluar:</span>
                <span className="tabular-nums">-{formatRupiah(totalExpenses)}</span>
              </div>
              <div className="py-3 flex justify-between font-bold bg-neutral-900 text-white px-3 rounded-xl text-sm">
                <span className="font-sans">LABA BERSIH (NET PROFIT):</span>
                <span className="tabular-nums text-base">{formatRupiah(netProfit)}</span>
              </div>
            </div>
          </div>

          {/* Top Selling Products Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-bold text-neutral-900 text-sm">
                Menu Terlaris & Kontribusi Laba Kotor
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-4">Nama Menu</th>
                    <th className="py-2.5 px-4 text-center">Terjual</th>
                    <th className="py-2.5 px-4 text-right">Total Omset</th>
                    <th className="py-2.5 px-4 text-right">Total HPP</th>
                    <th className="py-2.5 px-4 text-right">Laba Kotor</th>
                    <th className="py-2.5 px-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {topProducts.slice(0, 8).map((tp, idx) => {
                    const margin = tp.revenue > 0 ? Math.round((tp.profit / tp.revenue) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-neutral-50/60">
                        <td className="py-2.5 px-4 font-semibold text-neutral-900">
                          {tp.name}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono tabular-nums font-bold">
                          {tp.qty} porsi
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                          {formatRupiah(tp.revenue)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-500">
                          {formatRupiah(tp.cogs)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-emerald-900">
                          {formatRupiah(tp.profit)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-neutral-700">
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT (1 Col): Payment Methods Breakdown & Recent Invoices */}
        <div className="space-y-5">
          {/* Payment Method Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <h3 className="font-bold text-neutral-900 text-sm">Metode Pembayaran</h3>
            <div className="space-y-2 text-xs">
              {[
                { key: 'cash', label: 'Tunai (Cash)', color: 'bg-emerald-500' },
                { key: 'qris', label: 'QRIS Dinamis', color: 'bg-indigo-500' },
                { key: 'transfer', label: 'Transfer Bank', color: 'bg-blue-500' },
                { key: 'card', label: 'Kartu Debit/Kredit', color: 'bg-amber-500' },
                { key: 'credit', label: 'Tempo / Kasbon', color: 'bg-rose-500' },
              ].map(method => {
                const amount = paymentBreakdown[method.key] || 0;
                const pct = netSales > 0 ? Math.round((amount / netSales) * 100) : 0;
                return (
                  <div key={method.key} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-neutral-700">{method.label}</span>
                      <span className="font-mono tabular-nums text-neutral-900">{formatRupiah(amount)} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${method.color}`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions List with Quick Receipt Re-print */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <h3 className="font-bold text-neutral-900 text-sm">Riwayat Transaksi Terakhir</h3>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
              {filteredTransactions.slice(0, 10).map(trx => (
                <div 
                  key={trx.id}
                  className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-neutral-900">{trx.invoiceNumber}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {formatDateTime(trx.timestamp)} · {trx.paymentMethod.toUpperCase()}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="font-bold font-mono tabular-nums text-neutral-900">
                        {formatRupiah(trx.total)}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        Profit: {formatRupiah(trx.grossProfit)}
                      </div>
                    </div>

                    <button
                      onClick={() => setReceiptModalTransaction(trx)}
                      className="p-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg transition-colors"
                      title="Cetak Ulang Struk"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
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
