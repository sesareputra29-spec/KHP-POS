import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  CircleDollarSign, 
  Clock, 
  PlusCircle, 
  MinusCircle, 
  CheckCircle, 
  Printer, 
  AlertTriangle 
} from 'lucide-react';
import { formatRupiah, formatDateTime } from '../../utils/formatters';

export const ShiftModal: React.FC = () => {
  const { 
    isShiftModalOpen, 
    setIsShiftModalOpen, 
    currentShift, 
    startShift, 
    closeShift, 
    recordPettyCash, 
    currentUser,
    settings 
  } = useApp();

  // Open Shift Form
  const [startingCash, setStartingCash] = useState<number>(200000);

  // Petty Cash Form
  const [pettyType, setPettyType] = useState<'in' | 'out'>('out');
  const [pettyAmount, setPettyAmount] = useState<number>(0);
  const [pettyNotes, setPettyNotes] = useState('');

  // Close Shift Form
  const [isClosingMode, setIsClosingMode] = useState(false);
  const [actualCash, setActualCash] = useState<number>(currentShift ? currentShift.expectedCash : 0);
  const [closeNotes, setCloseNotes] = useState('');

  if (!isShiftModalOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    startShift(startingCash, `Modal awal shift oleh ${currentUser.name}`);
  };

  const handlePettySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pettyAmount <= 0) return;
    recordPettyCash(pettyType, pettyAmount, pettyNotes || (pettyType === 'in' ? 'Kas Masuk' : 'Kas Keluar'));
    setPettyAmount(0);
    setPettyNotes('');
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeShift(actualCash, closeNotes);
    setIsClosingMode(false);
    setIsShiftModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-neutral-200 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-neutral-900" />
            <h3 className="font-bold text-neutral-900 text-base">Manajemen Shift & Laci Kasir</h3>
          </div>
          <button
            onClick={() => { setIsShiftModalOpen(false); setIsClosingMode(false); }}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State A: NO ACTIVE SHIFT -> OPEN SHIFT FORM */}
        {!currentShift ? (
          <form onSubmit={handleStart} className="mt-4 space-y-4">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <p className="font-semibold text-neutral-800">Kasir Sedang Tutup</p>
              <p className="text-neutral-500 mt-0.5">
                Buka shift kasir baru dengan memasukkan modal kas awal (uang kembalian di laci).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Kas Modal Awal Laci (Rp):
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={startingCash}
                onChange={(e) => setStartingCash(Number(e.target.value))}
                className="w-full px-3 py-2 text-base font-bold font-mono tabular-nums border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[100000, 200000, 300000, 500000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStartingCash(amt)}
                  className="px-2.5 py-1 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-mono tabular-nums transition-colors"
                >
                  {formatRupiah(amt)}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Buka Shift Kasir Sekarang
            </button>
          </form>
        ) : isClosingMode ? (
          /* State B: CLOSING SHIFT AUDIT FORM */
          <form onSubmit={handleCloseShiftSubmit} className="mt-4 space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <p className="font-bold">Audit Hitung Fisik Tutup Kasir</p>
              <p className="text-amber-800 mt-0.5">
                Hitung seluruh uang fisik tunai di laci kasir untuk dibandingkan dengan hitungan sistem.
              </p>
            </div>

            <div className="space-y-1.5 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Modal Awal:</span>
                <span className="font-mono tabular-nums">{formatRupiah(currentShift.startingCash)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Total Penjualan Tunai:</span>
                <span className="font-mono tabular-nums">+{formatRupiah(currentShift.totalCashSales)}</span>
              </div>
              {currentShift.cashIn > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Kas Masuk Tambahan:</span>
                  <span className="font-mono tabular-nums">+{formatRupiah(currentShift.cashIn)}</span>
                </div>
              )}
              {currentShift.cashOut > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Kas Keluar Operasional:</span>
                  <span className="font-mono tabular-nums">-{formatRupiah(currentShift.cashOut)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-neutral-900 pt-1.5 border-t border-neutral-200">
                <span>Ekspektasi Kas Sistem:</span>
                <span className="font-mono tabular-nums text-sm">{formatRupiah(currentShift.expectedCash)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Hitungan Uang Fisik Nyata di Laci (Rp):
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={actualCash}
                onChange={(e) => setActualCash(Number(e.target.value))}
                className="w-full px-3 py-2 text-base font-bold font-mono tabular-nums border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Selisih Indicator */}
            {(() => {
              const diff = actualCash - currentShift.expectedCash;
              return (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  diff === 0 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : diff > 0 
                    ? 'bg-blue-50 border-blue-200 text-blue-900' 
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <span>Selisih Fisik vs Sistem:</span>
                  <span className="font-mono text-sm tabular-nums">
                    {diff === 0 ? 'Tepat Sesuai (Rp 0)' : diff > 0 ? `Lebih: +${formatRupiah(diff)}` : `Kurang: ${formatRupiah(diff)}`}
                  </span>
                </div>
              );
            })()}

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Catatan Penutupan Shift:
              </label>
              <textarea
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                placeholder="Catatan kendala / keterangan selisih..."
                rows={2}
                className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsClosingMode(false)}
                className="flex-1 py-2.5 px-3 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-2 py-2.5 px-4 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-xs"
              >
                Konfirmasi Tutup Shift Kasir
              </button>
            </div>
          </form>
        ) : (
          /* State C: ACTIVE SHIFT DASHBOARD */
          <div className="mt-4 space-y-4">
            {/* Shift Overview Cards */}
            <div className="p-3.5 bg-neutral-900 text-white rounded-xl">
              <div className="flex items-center justify-between text-xs opacity-80 mb-1">
                <span>Kasir Bertugas: {currentShift.cashierName}</span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3" />
                  Mulai {new Date(currentShift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums">
                {formatRupiah(currentShift.expectedCash)}
              </div>
              <div className="text-[11px] opacity-75 mt-0.5">
                Total Ekspektasi Kas Tunai di Laci Saat Ini
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="text-neutral-500 text-[11px]">Penjualan Tunai</p>
                <p className="text-sm font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
                  {formatRupiah(currentShift.totalCashSales)}
                </p>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="text-neutral-500 text-[11px]">Non-Tunai (QRIS/EDC)</p>
                <p className="text-sm font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
                  {formatRupiah(currentShift.totalNonCashSales)}
                </p>
              </div>
            </div>

            {/* Petty Cash In / Out Section */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-xs font-bold text-neutral-900 mb-2">Catat Kas Masuk / Keluar (Petty Cash)</p>
              <form onSubmit={handlePettySubmit} className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPettyType('out')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 ${
                      pettyType === 'out' 
                        ? 'bg-neutral-900 text-white border-neutral-900' 
                        : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Kas Keluar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPettyType('in')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 ${
                      pettyType === 'in' 
                        ? 'bg-neutral-900 text-white border-neutral-900' 
                        : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kas Masuk</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={pettyAmount || ''}
                    onChange={(e) => setPettyAmount(Number(e.target.value) || 0)}
                    placeholder="Nominal Rp"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono tabular-nums"
                  />
                  <input
                    type="text"
                    value={pettyNotes}
                    onChange={(e) => setPettyNotes(e.target.value)}
                    placeholder="Alasan / Keperluan"
                    className="flex-2 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-neutral-800 text-white text-xs font-semibold rounded-lg hover:bg-neutral-900"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>

            {/* Close Shift Trigger */}
            <div className="pt-2 border-t border-neutral-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setActualCash(currentShift.expectedCash);
                  setIsClosingMode(true);
                }}
                className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors"
              >
                Tutup Shift & Audit Kas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
