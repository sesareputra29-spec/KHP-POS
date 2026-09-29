import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Receipt, 
  Search, 
  Filter, 
  Printer, 
  Share2, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  UtensilsCrossed,
  Download
} from 'lucide-react';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { Transaction } from '../../types';

export const TransactionHistoryView: React.FC = () => {
  const { transactions, setReceiptModalTransaction, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'month' | 'all'>('all');
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  // Time boundaries
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOf7Days = startOfToday - (7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredTransactions = transactions.filter(t => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      t.invoiceNumber.toLowerCase().includes(q) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      t.cashierName.toLowerCase().includes(q) ||
      t.items.some(item => item.productName.toLowerCase().includes(q));

    // Filters
    const matchPayment = filterPayment === 'all' || t.paymentMethod === filterPayment;
    const matchType = filterType === 'all' || t.orderType === filterType;

    // Date
    let matchDate = true;
    if (dateFilter === 'today') matchDate = t.timestamp >= startOfToday;
    else if (dateFilter === '7days') matchDate = t.timestamp >= startOf7Days;
    else if (dateFilter === 'month') matchDate = t.timestamp >= startOfMonth;

    return matchQuery && matchPayment && matchType && matchDate;
  });

  const totalFilteredRevenue = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0);

  const totalFilteredCogs = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.totalCogs, 0);

  const totalFilteredGross = totalFilteredRevenue - totalFilteredCogs;

  const handleExportCsv = () => {
    const headers = ['No. Invoice', 'Waktu', 'Kasir', 'Tipe Pesanan', 'Pelanggan', 'Metode Bayar', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'HPP Modal', 'Laba Kotor', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.invoiceNumber,
      formatDateTime(t.timestamp),
      t.cashierName,
      t.orderType,
      t.customerName || 'Umum',
      t.paymentMethod,
      t.subtotal,
      t.discountTotal,
      t.taxAmount,
      t.total,
      t.totalCogs,
      t.grossProfit,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Riwayat_Transaksi_KHP_POS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Riwayat Transaksi Penjualan
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {filteredTransactions.length} Struk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Arsip seluruh transaksi kasir, detail item pesanan, dan cetak ulang struk thermal.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Export CSV / Excel</span>
        </button>
      </div>

      {/* KPI Cards for Filtered Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total Omset Penjualan</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(totalFilteredRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dari {filteredTransactions.length} transaksi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total HPP / Modal Bahan</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-700 font-mono">
            {formatRupiah(totalFilteredCogs)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Biaya modal pokok penjualan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Laba Kotor Terealisasi</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 font-mono">
            {formatRupiah(totalFilteredGross)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Margin: {totalFilteredRevenue > 0 ? ((totalFilteredGross / totalFilteredRevenue) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no. invoice, menu, kasir, pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Date Filter */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1.5 font-bold transition-colors ${dateFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-2.5 py-1.5 font-bold transition-colors ${dateFilter === 'today' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-2.5 py-1.5 font-bold transition-colors ${dateFilter === '7days' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-2.5 py-1.5 font-bold transition-colors ${dateFilter === 'month' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Payment Filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="all">Semua Metode</option>
            <option value="cash">Tunai (Cash)</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer Bank</option>
            <option value="card">EDC Kartu</option>
            <option value="credit">Tempo / Kasbon</option>
          </select>

          {/* Order Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="all">Semua Tipe</option>
            <option value="dine_in">Dine In</option>
            <option value="take_away">Take Away</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. Invoice</th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Kasir</th>
                <th className="px-4 py-3">Tipe / Meja</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Metode Bayar</th>
                <th className="px-4 py-3 text-right">HPP Modal</th>
                <th className="px-4 py-3 text-right">Total Transaksi</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {tx.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                      {formatDateTime(tx.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {tx.cashierName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.orderType === 'dine_in' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : tx.orderType === 'take_away' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {tx.orderType === 'dine_in' ? `Dine In ${tx.tableNumber ? `(M-${tx.tableNumber})` : ''}` :
                         tx.orderType === 'take_away' ? 'Take Away' : 'Delivery'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {tx.customerName || 'Pelanggan Umum'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap uppercase font-bold text-[10px]">
                      <span className={`px-2 py-0.5 rounded ${
                        tx.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-700' :
                        tx.paymentMethod === 'qris' ? 'bg-blue-50 text-blue-700' :
                        tx.paymentMethod === 'transfer' ? 'bg-purple-50 text-purple-700' :
                        tx.paymentMethod === 'card' ? 'bg-teal-50 text-teal-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500 whitespace-nowrap">
                      {formatRupiah(tx.totalCogs)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedTxDetail(tx)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => setReceiptModalTransaction(tx)}
                          className="p-1 text-slate-400 hover:text-emerald-700 transition-colors"
                          title="Cetak Ulang Struk"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Rincian Transaksi #{selectedTxDetail.invoiceNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(selectedTxDetail.timestamp)}</p>
              </div>
              <button onClick={() => setSelectedTxDetail(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Info Badges */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
                <div>Kasir: <strong className="text-slate-900">{selectedTxDetail.cashierName}</strong></div>
                <div>Pelanggan: <strong className="text-slate-900">{selectedTxDetail.customerName || 'Umum'}</strong></div>
                <div>Metode: <strong className="text-slate-900 uppercase">{selectedTxDetail.paymentMethod}</strong></div>
                <div>Tipe: <strong className="text-slate-900 capitalize">{selectedTxDetail.orderType}</strong></div>
              </div>

              {/* Items List */}
              <div>
                <div className="font-extrabold text-slate-800 mb-2">Item Terjual:</div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedTxDetail.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.quantity} x {formatRupiah(item.price)}
                          {item.cogs > 0 && <span className="ml-2 text-slate-400">(HPP: {formatRupiah(item.cogs)})</span>}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        {formatRupiah(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost & Profit Analysis */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 font-semibold text-emerald-950">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatRupiah(selectedTxDetail.subtotal)}</span>
                </div>
                {selectedTxDetail.discountTotal > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon:</span>
                    <span className="font-mono">-{formatRupiah(selectedTxDetail.discountTotal)}</span>
                  </div>
                )}
                {selectedTxDetail.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak (PB1):</span>
                    <span className="font-mono">+{formatRupiah(selectedTxDetail.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-emerald-200 text-slate-900">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-emerald-700">{formatRupiah(selectedTxDetail.total)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>HPP Modal: {formatRupiah(selectedTxDetail.totalCogs)}</span>
                  <span className="font-bold text-emerald-700">Laba Kotor: {formatRupiah(selectedTxDetail.grossProfit)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTxDetail(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptModalTransaction(selectedTxDetail);
                    setSelectedTxDetail(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Struk Thermal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
