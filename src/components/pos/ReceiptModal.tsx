import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Printer, 
  X, 
  Share2, 
  Check, 
  UtensilsCrossed, 
  Receipt as ReceiptIcon,
  Copy
} from 'lucide-react';
import { formatRupiah, formatDateTime } from '../../utils/formatters';

export const ReceiptModal: React.FC = () => {
  const { 
    receiptModalTransaction, 
    setReceiptModalTransaction, 
    settings 
  } = useApp();

  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(settings.receiptPaperSize || '58mm');
  const [printMode, setPrintMode] = useState<'customer' | 'kitchen'>('customer');
  const [copied, setCopied] = useState(false);

  if (!receiptModalTransaction) return null;

  const trx = receiptModalTransaction;

  const handlePrint = () => {
    window.print();
  };

  const generateTextReceipt = (): string => {
    let text = `*${settings.storeName}*\n`;
    text += `${settings.address}\nTelp: ${settings.phone}\n`;
    text += `--------------------------------\n`;
    text += `No. Faktur: ${trx.invoiceNumber}\n`;
    text += `Waktu     : ${formatDateTime(trx.timestamp)}\n`;
    text += `Kasir     : ${trx.cashierName}\n`;
    text += `Pesanan   : ${trx.orderType === 'dine_in' ? `Dine In (${trx.tableNumber || 'Meja'})` : trx.orderType === 'take_away' ? 'Take Away' : 'Delivery'}\n`;
    if (trx.customerName) text += `Pelanggan : ${trx.customerName}\n`;
    text += `--------------------------------\n`;
    trx.items.forEach(it => {
      text += `${it.productName}\n`;
      text += `  ${it.quantity} x ${formatRupiah(it.price)} = ${formatRupiah(it.subtotal)}\n`;
      if (it.note) text += `  _Catatan: ${it.note}_\n`;
    });
    text += `--------------------------------\n`;
    text += `Subtotal  : ${formatRupiah(trx.subtotal)}\n`;
    if (trx.discountTotal > 0) text += `Diskon    : -${formatRupiah(trx.discountTotal)}\n`;
    if (trx.taxAmount > 0) text += `PPN (${trx.taxPercent}%): ${formatRupiah(trx.taxAmount)}\n`;
    if (trx.serviceChargeAmount > 0) text += `Layanan   : ${formatRupiah(trx.serviceChargeAmount)}\n`;
    text += `*TOTAL     : ${formatRupiah(trx.total)}*\n`;
    text += `Bayar (${trx.paymentMethod.toUpperCase()}): ${formatRupiah(trx.paymentDetails.cashGiven || trx.total)}\n`;
    if (trx.paymentDetails.change && trx.paymentDetails.change > 0) {
      text += `Kembali   : ${formatRupiah(trx.paymentDetails.change)}\n`;
    }
    text += `--------------------------------\n`;
    text += `${settings.receiptFooterMessage}\n`;
    return text;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateTextReceipt());
    const phone = trx.customerPhone ? trx.customerPhone.replace(/\D/g, '') : '';
    const url = phone 
      ? `https://wa.me/${phone.startsWith('0') ? '62' + phone.slice(1) : phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateTextReceipt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-5 border border-neutral-200 relative my-auto">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 no-print">
          <div className="flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-neutral-800" />
            <span className="font-bold text-neutral-900 text-sm">Struk Transaksi Selesai</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaperWidth(paperWidth === '58mm' ? '80mm' : '58mm')}
              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-md text-[11px] font-mono text-neutral-700 transition-colors"
              title="Ganti lebar kertas struk"
            >
              Kertas: {paperWidth}
            </button>
            <button
              onClick={() => setReceiptModalTransaction(null)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Mode Switcher (Customer vs Kitchen Ticket) */}
        <div className="flex gap-1.5 mt-3 mb-2 p-1 bg-neutral-100 rounded-xl no-print text-xs">
          <button
            onClick={() => setPrintMode('customer')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              printMode === 'customer' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            <ReceiptIcon className="w-3.5 h-3.5" />
            <span>Struk Pelanggan</span>
          </button>
          <button
            onClick={() => setPrintMode('kitchen')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              printMode === 'kitchen' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Tiket Dapur</span>
          </button>
        </div>

        {/* Thermal Receipt Printable Container */}
        <div className="my-3 flex justify-center bg-neutral-100/70 p-3 rounded-xl border border-neutral-200 overflow-x-auto">
          <div 
            id="printable-receipt"
            style={{ width: paperWidth === '58mm' ? '240px' : '300px' }}
            className="bg-white p-4 shadow-sm border border-neutral-200 text-neutral-900 font-mono text-[11px] leading-tight select-text"
          >
            {printMode === 'customer' ? (
              /* CUSTOMER RECEIPT */
              <>
                {/* Store Header */}
                <div className="text-center mb-3">
                  <h4 className="font-bold text-sm tracking-tight uppercase">{settings.storeName}</h4>
                  <p className="text-[10px] text-neutral-600">{settings.tagline}</p>
                  <p className="text-[10px] text-neutral-600">{settings.address}</p>
                  <p className="text-[10px] text-neutral-600">Telp: {settings.phone}</p>
                </div>

                <div className="border-b border-dashed border-neutral-400 my-2" />

                {/* Meta */}
                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>No. Faktur:</span>
                    <span className="font-semibold">{trx.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{formatDateTime(trx.timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{trx.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pesanan:</span>
                    <span className="font-semibold uppercase">
                      {trx.orderType === 'dine_in' ? `Dine In (${trx.tableNumber || 'Meja'})` : trx.orderType === 'take_away' ? 'Take Away' : 'Delivery'}
                    </span>
                  </div>
                  {trx.customerName && (
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span>{trx.customerName}</span>
                    </div>
                  )}
                </div>

                <div className="border-b border-dashed border-neutral-400 my-2" />

                {/* Items */}
                <div className="space-y-2 my-2">
                  {trx.items.map((item, idx) => (
                    <div key={idx}>
                      <div className="font-semibold">{item.productName}</div>
                      <div className="flex justify-between text-neutral-600">
                        <span>{item.quantity} x {formatRupiah(item.price)}</span>
                        <span className="text-neutral-900 font-semibold tabular-nums">{formatRupiah(item.subtotal)}</span>
                      </div>
                      {item.note && (
                        <div className="text-[9px] italic text-neutral-500 pl-2">
                          * {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-b border-dashed border-neutral-400 my-2" />

                {/* Calculations */}
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="tabular-nums">{formatRupiah(trx.subtotal)}</span>
                  </div>
                  {trx.discountTotal > 0 && (
                    <div className="flex justify-between text-neutral-700">
                      <span>Diskon:</span>
                      <span className="tabular-nums">-{formatRupiah(trx.discountTotal)}</span>
                    </div>
                  )}
                  {trx.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>PPN ({trx.taxPercent}%):</span>
                      <span className="tabular-nums">{formatRupiah(trx.taxAmount)}</span>
                    </div>
                  )}
                  {trx.serviceChargeAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Biaya Layanan ({trx.serviceChargePercent}%):</span>
                      <span className="tabular-nums">{formatRupiah(trx.serviceChargeAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-neutral-300">
                    <span>TOTAL:</span>
                    <span className="tabular-nums">{formatRupiah(trx.total)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Metode Bayar:</span>
                    <span className="uppercase font-semibold">{trx.paymentMethod}</span>
                  </div>
                  {trx.paymentMethod === 'cash' && trx.paymentDetails.cashGiven && (
                    <>
                      <div className="flex justify-between">
                        <span>Tunai:</span>
                        <span className="tabular-nums">{formatRupiah(trx.paymentDetails.cashGiven)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Kembali:</span>
                        <span className="tabular-nums">{formatRupiah(trx.paymentDetails.change || 0)}</span>
                      </div>
                    </>
                  )}
                  {trx.paymentDetails.referenceNumber && (
                    <div className="flex justify-between text-[9px] text-neutral-500">
                      <span>Ref / Trx ID:</span>
                      <span>{trx.paymentDetails.referenceNumber}</span>
                    </div>
                  )}
                </div>

                <div className="border-b border-dashed border-neutral-400 my-2" />

                {/* Footer Message */}
                <div className="text-center text-[9px] text-neutral-600 whitespace-pre-line mt-2">
                  {settings.receiptFooterMessage}
                </div>
              </>
            ) : (
              /* KITCHEN ORDER TICKET */
              <>
                <div className="text-center mb-2">
                  <h4 className="font-bold text-base tracking-tight uppercase">TIKET DAPUR / BAR</h4>
                  <p className="text-xs font-bold text-neutral-800">
                    {trx.orderType === 'dine_in' ? `[DINE IN] ${trx.tableNumber || 'MEJA'}` : `[TAKE AWAY]`}
                  </p>
                  <p className="text-[10px] text-neutral-500">{trx.invoiceNumber}</p>
                  <p className="text-[10px] text-neutral-500">{formatDateTime(trx.timestamp)}</p>
                </div>

                <div className="border-b-2 border-black my-2" />

                <div className="space-y-3 my-2 text-xs">
                  {trx.items.map((item, idx) => (
                    <div key={idx} className="border-b border-dashed border-neutral-300 pb-1.5">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-sm">{item.quantity}x {item.productName}</span>
                      </div>
                      {item.note ? (
                        <div className="text-[11px] font-bold text-neutral-900 bg-neutral-100 p-1 mt-1 rounded-sm">
                          Catatan: {item.note}
                        </div>
                      ) : (
                        <div className="text-[10px] text-neutral-400">Standar</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-b border-black my-2" />
                <div className="text-center text-[10px] font-semibold">
                  Kasir: {trx.cashierName} · Waktu Cetak: {new Date().toLocaleTimeString('id-ID')}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-4 flex flex-col gap-2 no-print">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Thermal ({paperWidth})</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
              title="Kirim Struk ke WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleCopyText}
              className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors"
              title="Salin Teks Struk"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => setReceiptModalTransaction(null)}
            className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Selesai / Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
};
