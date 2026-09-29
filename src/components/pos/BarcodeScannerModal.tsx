import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, ScanBarcode, CheckCircle2, AlertCircle } from 'lucide-react';

export const BarcodeScannerModal: React.FC = () => {
  const { isBarcodeScannerOpen, setIsBarcodeScannerOpen, products, addToCart } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [lastScannedResult, setLastScannedResult] = useState<{ name: string; sku: string; price: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'reader-qr-view';

  // Process a scanned or typed code
  const handleProcessCode = (code: string) => {
    const cleanCode = code.trim().toLowerCase();
    if (!cleanCode) return;

    const matchedProduct = products.find(
      p => p.active && (p.barcode.toLowerCase() === cleanCode || p.sku.toLowerCase() === cleanCode)
    );

    if (matchedProduct) {
      addToCart(matchedProduct, 1);
      setLastScannedResult({
        name: matchedProduct.name,
        sku: matchedProduct.sku,
        price: matchedProduct.price,
      });
      setErrorMsg('');
      setManualCode('');

      // Auto close or provide audio feedback
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        // audio fail ok
      }
    } else {
      setErrorMsg(`Produk dengan Barcode / SKU "${code}" tidak ditemukan dalam katalog.`);
      setLastScannedResult(null);
    }
  };

  // Start Html5Qrcode camera when opened
  useEffect(() => {
    if (!isBarcodeScannerOpen) {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
          setIsCameraActive(false);
        }).catch(() => {
          scannerRef.current = null;
          setIsCameraActive(false);
        });
      }
      return;
    }

    const timer = setTimeout(() => {
      try {
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 160 },
          },
          (decodedText) => {
            handleProcessCode(decodedText);
          },
          () => {
            // scan error or idle frame
          }
        ).then(() => {
          setIsCameraActive(true);
        }).catch(err => {
          console.warn('Camera error or permission denied:', err);
          setIsCameraActive(false);
        });
      } catch (e) {
        console.warn('Init scanner failed:', e);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
    };
  }, [isBarcodeScannerOpen]);

  if (!isBarcodeScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 relative border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-neutral-900" />
            <h3 className="font-bold text-neutral-900 text-base">Pemindai Barcode / SKU</h3>
          </div>
          <button
            onClick={() => setIsBarcodeScannerOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="mt-4 relative bg-neutral-950 rounded-xl overflow-hidden min-h-[220px] flex flex-col items-center justify-center">
          <div id={scannerContainerId} className="w-full h-full min-h-[220px]" />
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 p-4 text-center">
              <Camera className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">
                Kamera sedang dipersiapkan atau gunakan scanner USB / input manual di bawah.
              </p>
            </div>
          )}
        </div>

        {/* Scan Feedback */}
        {lastScannedResult && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-900 truncate">
                + Masuk Keranjang: {lastScannedResult.name}
              </p>
              <p className="text-emerald-700 font-mono text-[11px]">
                SKU: {lastScannedResult.sku}
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-xs text-red-800 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Manual Barcode Input / Hardware Barcode Gun Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleProcessCode(manualCode);
          }}
          className="mt-4"
        >
          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
            Input Kode Barcode / Gun Scanner USB:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Contoh: 8991001001 atau SKU"
              className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              Cari & Tambah
            </button>
          </div>
        </form>

        {/* Quick Test Barcode Buttons for immediate testing */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-1.5">
            Klik Cepat Simulasi Scan Barcode:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {products.slice(0, 4).map(p => (
              <button
                key={p.id}
                onClick={() => handleProcessCode(p.barcode)}
                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-[11px] font-mono transition-colors"
              >
                {p.barcode} ({p.name.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
