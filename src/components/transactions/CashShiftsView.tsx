import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CircleDollarSign, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle, 
  AlertTriangle,
  History, 
  PlusCircle, 
  MinusCircle, 
  Lock, 
  Unlock,
  Printer
} from 'lucide-react';
import { formatRupiah, formatDateTime } from '../../utils/formatters';

export const CashShiftsView: React.FC = () => {
  const { 
    currentShift, 
    shiftsHistory, 
    setIsShiftModalOpen, 
    currentUser,
    recordPettyCash 
  } = useApp();

  const [isPettyModalOpen, setIsPettyModalOpen] = useState(false);
  const [pettyType, setPettyType] = useState<'in' | 'out'>('in');
  const [pettyAmount, setPettyAmount] = useState<number>(50000);
  const [pettyNotes, setPettyNotes] = useState('');
  const [notice, setNotice] = useState('');

  const handlePettySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pettyAmount <= 0) return;

    recordPettyCash(pettyType, pettyAmount, pettyNotes || (pettyType === 'in' ? 'Kas Masuk Operasional' : 'Kas Keluar Operasional'));
    setNotice(`${pettyType === 'in' ? 'Kas Masuk' : 'Kas Keluar'} sebesar ${formatRupiah(pettyAmount)} berhasil dicatat di shift kasir!`);
    setIsPettyModalOpen(false);
    setPettyNotes('');
    setTimeout(() => setNotice(''), 3500);
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
              Manajemen Kas & Shift Kasir
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              currentShift ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {currentShift ? 'Shift Aktif' : 'Kasir Tutup'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring saldo laci kasir, setoran kas operasional, dan riwayat tutup shift harian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentShift && (
            <button
              onClick={() => setIsPettyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all"
            >
              <CircleDollarSign className="w-4 h-4 text-emerald-600" />
              <span>Kas Masuk / Keluar</span>
            </button>
          )}

          <button
            onClick={() => setIsShiftModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold shadow-sm transition-all ${
              currentShift ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {currentShift ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>{currentShift ? 'Tutup & Hitung Shift' : 'Buka Shift Baru'}</span>
          </button>
        </div>
      </div>

      {/* Active Shift Overview Box */}
      {currentShift ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">
                  Shift #{currentShift.id.slice(-6)} · {currentShift.cashierName}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Dibuka: {formatDateTime(currentShift.startTime)}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Estimasi Kas di Laci</div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono">
                {formatRupiah(currentShift.expectedCash)}
              </div>
            </div>
          </div>

          {/* Metric Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Modal Awal Kasir</div>
              <div className="font-mono font-bold text-sm text-slate-800 mt-1">
                {formatRupiah(currentShift.startingCash)}
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Penjualan Tunai</div>
              <div className="font-mono font-bold text-sm text-emerald-900 mt-1">
                +{formatRupiah(currentShift.totalCashSales)}
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="text-[10px] uppercase font-bold text-blue-700">Penjualan Non-Tunai</div>
              <div className="font-mono font-bold text-sm text-blue-900 mt-1">
                {formatRupiah(currentShift.totalNonCashSales)}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Kas Masuk / Keluar</div>
              <div className="font-mono font-bold text-sm text-slate-800 mt-1">
                +{formatRupiah(currentShift.cashIn)} / -{formatRupiah(currentShift.cashOut)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-amber-950 text-base">Kasir Saat Ini Sedang Tutup</h3>
            <p className="text-xs text-amber-800 max-w-md mx-auto mt-1">
              Buka shift kasir baru dengan menginput modal uang kembalian di laci kasir sebelum memulai transaksi POS.
            </p>
          </div>
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            Buka Shift Kasir Sekarang
          </button>
        </div>
      )}

      {/* Shifts History Log */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <span className="font-extrabold text-xs text-slate-700">Riwayat Tutup Shift Lampau</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">{shiftsHistory.length} Sesi Shift</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ID Shift</th>
                <th className="px-4 py-3">Kasir</th>
                <th className="px-4 py-3">Waktu Buka - Tutup</th>
                <th className="px-4 py-3 text-right">Modal Awal</th>
                <th className="px-4 py-3 text-right">Total Penjualan</th>
                <th className="px-4 py-3 text-right">Kas Fisik</th>
                <th className="px-4 py-3 text-right">Selisih</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shiftsHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Belum ada riwayat shift yang ditutup.
                  </td>
                </tr>
              ) : (
                shiftsHistory.map((s) => {
                  const diff = s.difference || 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        #{s.id.slice(-6)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {s.cashierName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDateTime(s.startTime)} <br />
                        <span className="text-slate-400">s/d {s.endTime ? formatDateTime(s.endTime) : '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        {formatRupiah(s.startingCash)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(s.totalCashSales + s.totalNonCashSales)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                        {s.actualCashCounted !== undefined ? formatRupiah(s.actualCashCounted) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                        {diff === 0 ? (
                          <span className="text-emerald-600">Pas (Rp 0)</span>
                        ) : diff > 0 ? (
                          <span className="text-blue-600">+{formatRupiah(diff)}</span>
                        ) : (
                          <span className="text-red-600">-{formatRupiah(Math.abs(diff))}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {s.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Petty Cash Modal */}
      {isPettyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Kas Masuk / Kas Keluar Operasional</h3>
              <button onClick={() => setIsPettyModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handlePettySubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Arus Kas</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPettyType('in')}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all text-center ${
                      pettyType === 'in' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    + Kas Masuk (Tambah Saldo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPettyType('out')}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all text-center ${
                      pettyType === 'out' 
                        ? 'bg-red-50 border-red-500 text-red-800 shadow-xs' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    - Kas Keluar (Beli Keperluan)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={pettyAmount}
                  onChange={(e) => setPettyAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Alasan</label>
                <input
                  type="text"
                  placeholder="Contoh: Beli es batu tambahan / Beli plastik klip"
                  value={pettyNotes}
                  onChange={(e) => setPettyNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPettyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Simpan Arus Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
