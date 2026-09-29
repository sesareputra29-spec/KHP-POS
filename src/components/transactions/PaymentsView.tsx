import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  Building2, 
  Clock, 
  CheckCircle, 
  Search, 
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  User,
  Phone,
  Receipt,
  FileCheck
} from 'lucide-react';
import { formatRupiah, formatDateTime, formatNumber } from '../../utils/formatters';
import { PaymentMethod } from '../../types';

export const PaymentsView: React.FC = () => {
  const { transactions, customers, updateCustomer, setReceiptModalTransaction } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'methods' | 'credits'>('methods');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState('');

  // Payment settle modal
  const [settlingCustomer, setSettlingCustomer] = useState<any | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('cash');

  // Calculate payment methods revenue distribution
  const completedTrx = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTrx.reduce((sum, t) => sum + t.total, 0);

  const getMethodTotal = (method: PaymentMethod) => {
    return completedTrx.filter(t => t.paymentMethod === method).reduce((sum, t) => sum + t.total, 0);
  };

  const getMethodCount = (method: PaymentMethod) => {
    return completedTrx.filter(t => t.paymentMethod === method).length;
  };

  const cashTotal = getMethodTotal('cash');
  const qrisTotal = getMethodTotal('qris');
  const transferTotal = getMethodTotal('transfer');
  const cardTotal = getMethodTotal('card');
  const creditTotal = getMethodTotal('credit');

  // Customers with outstanding credit
  const debtCustomers = customers.filter(c => (c.outstandingCredit || 0) > 0);
  const totalOutstandingCredit = debtCustomers.reduce((sum, c) => sum + (c.outstandingCredit || 0), 0);

  const handleSettleDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingCustomer || settleAmount <= 0) return;

    const remainingDebt = Math.max(0, (settlingCustomer.outstandingCredit || 0) - settleAmount);
    updateCustomer({
      ...settlingCustomer,
      outstandingCredit: remainingDebt
    });

    setNotice(`Pelunasan kasbon Rp ${formatRupiah(settleAmount)} untuk ${settlingCustomer.name} berhasil dicatat! Sisa kasbon: ${formatRupiah(remainingDebt)}`);
    setSettlingCustomer(null);
    setSettleAmount(0);
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none space-y-4">
      {/* Notice Banner */}
      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Metode Pembayaran & Piutang
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {formatRupiah(totalRevenue)} Omset
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekap transaksi per kanal bayar (Tunai, QRIS, Transfer, EDC) dan kontrol piutang/kasbon pelanggan.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            onClick={() => setActiveTabSub('methods')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTabSub === 'methods' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Kanal Pembayaran
          </button>
          <button
            onClick={() => setActiveTabSub('credits')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTabSub === 'credits' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Piutang / Kasbon</span>
            {debtCustomers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                {debtCustomers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTabSub === 'methods' ? (
        <div className="space-y-4">
          {/* Channel Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Tunai */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Tunai / Cash</span>
                <Banknote className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono">
                {formatRupiah(cashTotal)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                <span>{getMethodCount('cash')} Struk</span>
                <span>{totalRevenue > 0 ? ((cashTotal / totalRevenue) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>

            {/* QRIS */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>QRIS Instant</span>
                <QrCode className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono">
                {formatRupiah(qrisTotal)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                <span>{getMethodCount('qris')} Struk</span>
                <span>{totalRevenue > 0 ? ((qrisTotal / totalRevenue) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>

            {/* Transfer Bank */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Transfer Bank</span>
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono">
                {formatRupiah(transferTotal)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                <span>{getMethodCount('transfer')} Struk</span>
                <span>{totalRevenue > 0 ? ((transferTotal / totalRevenue) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>

            {/* Kartu EDC */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Kartu Debit/Kredit</span>
                <CreditCard className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono">
                {formatRupiah(cardTotal)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                <span>{getMethodCount('card')} Struk</span>
                <span>{totalRevenue > 0 ? ((cardTotal / totalRevenue) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>

            {/* Tempo */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Tempo / Kasbon</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-lg font-extrabold text-amber-950 font-mono">
                {formatRupiah(creditTotal)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                <span>{getMethodCount('credit')} Struk</span>
                <span>{totalRevenue > 0 ? ((creditTotal / totalRevenue) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions List with Payment Details */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-700">Rincian Transaksi Berdasarkan Metode Bayar</span>
              <span className="text-[11px] text-slate-500 font-medium">Diurutkan dari transaksi terbaru</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">No. Invoice</th>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Metode Bayar</th>
                    <th className="px-4 py-3">Pelanggan</th>
                    <th className="px-4 py-3">Rincian / Bank / Ref</th>
                    <th className="px-4 py-3 text-right">Total Transaksi</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedTrx.slice(0, 15).map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {trx.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                        {formatDateTime(trx.timestamp)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          trx.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          trx.paymentMethod === 'qris' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          trx.paymentMethod === 'transfer' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          trx.paymentMethod === 'card' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {trx.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {trx.customerName || 'Umum'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {trx.paymentMethod === 'cash' && `Diberi: ${formatRupiah(trx.paymentDetails.cashGiven || trx.total)}`}
                        {trx.paymentMethod === 'transfer' && `${trx.paymentDetails.bankName || 'BCA'} (Ref: ${trx.paymentDetails.referenceNumber || '-'})`}
                        {trx.paymentMethod === 'card' && `EDC (Ref: ${trx.paymentDetails.referenceNumber || '-'})`}
                        {trx.paymentMethod === 'credit' && `Jatuh Tempo: ${trx.paymentDetails.dueDate || '30 Hari'}`}
                        {trx.paymentMethod === 'qris' && 'QRIS Terverifikasi'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                        {formatRupiah(trx.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setReceiptModalTransaction(trx)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-bold text-slate-700 transition-colors"
                        >
                          Lihat Struk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Credits / Piutang View */
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <div className="font-extrabold text-amber-950 text-sm">
                  Total Piutang Belum Lunas: {formatRupiah(totalOutstandingCredit)}
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  Terdapat {debtCustomers.length} pelanggan dengan tagihan tempo aktif.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Pelanggan</th>
                    <th className="px-4 py-3">No. Telepon</th>
                    <th className="px-4 py-3 text-right">Total Belanja</th>
                    <th className="px-4 py-3 text-right">Sisa Kasbon / Piutang</th>
                    <th className="px-4 py-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debtCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Tidak ada pelanggan dengan tagihan kasbon atau tempo.
                      </td>
                    </tr>
                  ) : (
                    debtCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {cust.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          {cust.phone}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700">
                          {formatRupiah(cust.totalSpent)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-amber-600">
                          {formatRupiah(cust.outstandingCredit)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSettlingCustomer(cust);
                              setSettleAmount(cust.outstandingCredit);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all"
                          >
                            Catat Pelunasan
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Settle Debt Modal */}
      {settlingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Pelunasan Kasbon Pelanggan</h3>
                <p className="text-xs text-slate-500 mt-0.5">{settlingCustomer.name}</p>
              </div>
              <button onClick={() => setSettlingCustomer(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSettleDebt} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between font-bold text-amber-950">
                <span>Total Hutang Saat Ini:</span>
                <span className="font-mono text-sm">{formatRupiah(settlingCustomer.outstandingCredit)}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Pembayaran (Rp)</label>
                <input
                  type="number"
                  min="1000"
                  max={settlingCustomer.outstandingCredit}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kanal Penerimaan</label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cash">Tunai / Uang Laci Kasir</option>
                  <option value="transfer">Transfer Bank (BCA / Mandiri)</option>
                  <option value="qris">QRIS Toko</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettlingCustomer(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Konfirmasi Pelunasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
