import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Building2, 
  Clock, 
  CheckCircle, 
  User, 
  Phone, 
  MapPin, 
  Percent 
} from 'lucide-react';
import { PaymentMethod } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: 'dine_in' | 'take_away' | 'delivery';
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  orderType,
  tableNumber,
  setTableNumber,
  customerName,
  setCustomerName,
}) => {
  const { 
    cartTotal, 
    cartSubtotal, 
    cartTaxAmount, 
    cartServiceAmount, 
    cartDiscountTotal, 
    checkout,
    settings 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(cartTotal);
  const [cashInputStr, setCashInputStr] = useState<string>(cartTotal.toString());
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountNominal, setDiscountNominal] = useState<number>(0);
  const [bankName, setBankName] = useState('BCA');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
  const [qrisSimulatedSuccess, setQrisSimulatedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentTotal = Math.max(0, cartTotal - discountNominal);
  const change = Math.max(0, cashGiven - currentTotal);
  const isCashSufficient = cashGiven >= currentTotal;

  // Handle Cash Input
  const handleCashChange = (valStr: string) => {
    const clean = valStr.replace(/\D/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    setCashInputStr(num ? num.toLocaleString('id-ID') : '');
    setCashGiven(num);
  };

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount);
    setCashInputStr(amount.toLocaleString('id-ID'));
  };

  const handlePay = () => {
    if (paymentMethod === 'cash' && !isCashSufficient) {
      alert('Nominal uang tunai yang diterima kurang dari total tagihan!');
      return;
    }

    checkout({
      paymentMethod,
      cashGiven: paymentMethod === 'cash' ? cashGiven : undefined,
      orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      discountTotal: discountNominal,
      bankName: paymentMethod === 'transfer' ? bankName : undefined,
      referenceNumber: referenceNumber || (paymentMethod === 'qris' ? `QRIS-${Date.now().toString().slice(-6)}` : undefined),
      dueDate: paymentMethod === 'credit' ? dueDate : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 border border-neutral-200 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="font-bold text-neutral-900 text-lg sm:text-xl">Pembayaran Pesanan</h3>
            <p className="text-xs text-neutral-500">Pilih metode pembayaran dan masukkan detail pelanggan</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer & Order Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
          <div>
            <label className="block text-neutral-500 font-medium mb-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Nama Pelanggan
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Pelanggan Umum"
              className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-neutral-500 font-medium mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> No. WhatsApp / HP
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="08xxxxxxxx"
              className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-xs font-mono"
            />
          </div>

          {orderType === 'dine_in' ? (
            <div>
              <label className="block text-neutral-500 font-medium mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> No. Meja
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Contoh: Meja 05"
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="block text-neutral-500 font-medium mb-1 flex items-center gap-1">
                <Percent className="w-3 h-3" /> Diskon Transaksi (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={discountNominal || ''}
                onChange={(e) => setDiscountNominal(Number(e.target.value) || 0)}
                placeholder="Rp 0"
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-xs font-mono tabular-nums"
              />
            </div>
          )}
        </div>

        {/* Payment Methods Selector Tabs */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-neutral-700 mb-2">Metode Pembayaran:</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'cash', label: 'Tunai', icon: Banknote },
              { id: 'qris', label: 'QRIS', icon: QrCode },
              { id: 'transfer', label: 'Transfer', icon: Building2 },
              { id: 'card', label: 'Kartu/EDC', icon: CreditCard },
              { id: 'credit', label: 'Tempo', icon: Clock },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method.id as PaymentMethod);
                    if (method.id === 'cash') {
                      setCashGiven(currentTotal);
                      setCashInputStr(currentTotal.toLocaleString('id-ID'));
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="truncate">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Form Content */}
        <div className="mt-4 p-4 rounded-xl border border-neutral-200 bg-neutral-50">
          {/* Method: TUNAI (CASH) */}
          {paymentMethod === 'cash' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-700">Uang Tunai Diterima:</span>
                <span className="text-xs text-neutral-500 font-mono tabular-nums">
                  Tagihan: {formatRupiah(currentTotal)}
                </span>
              </div>

              {/* Cash Input */}
              <div className="relative mb-3">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">Rp</span>
                <input
                  type="text"
                  value={cashInputStr}
                  onChange={(e) => handleCashChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-2 bg-white text-lg font-bold font-mono tabular-nums text-neutral-900 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button
                  type="button"
                  onClick={() => handleQuickCash(currentTotal)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Uang Pas
                </button>
                {[10000, 20000, 50000, 100000, 200000, 500000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickCash(amt)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors font-mono tabular-nums"
                  >
                    {amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>

              {/* Kembalian Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isCashSufficient
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <span className="text-xs font-semibold">
                  {isCashSufficient ? 'Kembalian:' : 'Uang Kurang:'}
                </span>
                <span className="text-lg font-bold font-mono tabular-nums">
                  {isCashSufficient ? formatRupiah(change) : formatRupiah(currentTotal - cashGiven)}
                </span>
              </div>
            </div>
          )}

          {/* Method: QRIS */}
          {paymentMethod === 'qris' && (
            <div className="text-center py-2">
              <div className="inline-block p-3 bg-white border border-neutral-200 rounded-2xl shadow-xs mb-3">
                {/* Simulated QR Code Visual */}
                <div className="w-36 h-36 mx-auto bg-neutral-900 p-2 rounded-xl flex flex-col items-center justify-center text-white relative">
                  <QrCode className="w-28 h-28 text-white" />
                  <span className="absolute bottom-1 bg-white text-neutral-900 text-[8px] font-bold px-1 rounded-sm">
                    QRIS RESMI
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-600 mb-1">
                Scan kode QRIS di atas dengan GoPay, OVO, Dana, BCA Mobile, atau ShopeePay.
              </p>
              <p className="text-base font-bold font-mono tabular-nums text-neutral-900 mb-3">
                {formatRupiah(currentTotal)}
              </p>
              
              <button
                type="button"
                onClick={() => setQrisSimulatedSuccess(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors inline-flex items-center gap-1.5 ${
                  qrisSimulatedSuccess 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {qrisSimulatedSuccess ? 'Pembayaran QRIS Terverifikasi!' : 'Simulasi Notifikasi QRIS Berhasil'}
              </button>
            </div>
          )}

          {/* Method: TRANSFER */}
          {paymentMethod === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Pilih Bank Rekening:</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {['BCA', 'Mandiri', 'BRI', 'BNI'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBankName(b)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-colors ${
                      bankName === b 
                        ? 'border-neutral-900 bg-neutral-900 text-white' 
                        : 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="p-3 bg-white rounded-xl border border-neutral-200 mb-3 text-xs">
                <p className="text-neutral-500">Nomor Rekening {bankName}:</p>
                <p className="text-sm font-mono font-bold text-neutral-900">
                  {bankName === 'BCA' ? '8830-1928-331' : bankName === 'Mandiri' ? '137-00-19283-4' : '0231-01-098273-50-1'}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">a/n {settings.storeName}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Nomor Referensi / Nama Pengirim:
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Contoh: TRF-BCA-10293 atau Nama Rekening"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
                />
              </div>
            </div>
          )}

          {/* Method: CARD / EDC */}
          {paymentMethod === 'card' && (
            <div>
              <p className="text-xs text-neutral-600 mb-2">Gesek / Masukkan Kartu Debit atau Kredit di Mesin EDC.</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Nomor Approval / Trace No. EDC:
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Contoh: APPR-881923"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Method: TEMPO / KASBON */}
          {paymentMethod === 'credit' && (
            <div>
              <p className="text-xs text-neutral-600 mb-2">
                Pencatatan piutang / kasbon pelanggan langganan.
              </p>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Tanggal Jatuh Tempo Pelunasan:
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Breakdown */}
        <div className="mt-4 pt-3 border-t border-neutral-100 text-xs space-y-1">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal Produk:</span>
            <span className="font-mono tabular-nums">{formatRupiah(cartSubtotal)}</span>
          </div>
          {discountNominal > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Diskon Transaksi:</span>
              <span className="font-mono tabular-nums">-{formatRupiah(discountNominal)}</span>
            </div>
          )}
          {settings.enableTax && (
            <div className="flex justify-between text-neutral-600">
              <span>PPN ({settings.taxPercent}%):</span>
              <span className="font-mono tabular-nums">+{formatRupiah(cartTaxAmount)}</span>
            </div>
          )}
          {settings.enableServiceCharge && (
            <div className="flex justify-between text-neutral-600">
              <span>Biaya Layanan ({settings.serviceChargePercent}%):</span>
              <span className="font-mono tabular-nums">+{formatRupiah(cartServiceAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm sm:text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
            <span>Total Tagihan:</span>
            <span className="font-mono tabular-nums text-neutral-900">{formatRupiah(currentTotal)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={paymentMethod === 'cash' && !isCashSufficient}
            className="flex-2 py-2.5 px-4 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Selesaikan & Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
