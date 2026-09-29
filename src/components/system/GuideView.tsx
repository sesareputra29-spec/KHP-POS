import React, { useState } from 'react';
import { 
  BookOpen, 
  ShoppingCart, 
  Calculator, 
  Boxes, 
  Printer, 
  ShieldCheck, 
  ScanBarcode, 
  ChevronRight, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Settings
} from 'lucide-react';

export const GuideView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<'pos' | 'hpp' | 'inventory' | 'printer' | 'users' | 'faq'>('pos');

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Panduan Operasional KHP POS V4
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              SOP Resmi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Petunjuk lengkap penggunaan sistem POS kasir, perhitungan kalkulator HPP resep, dan manajemen stok otomatis.
          </p>
        </div>
      </div>

      {/* Main Grid: Sidebar topics + Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
        {/* Topic Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-1.5 h-fit">
          <button
            onClick={() => setSelectedTopic('pos')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              selectedTopic === 'pos' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4" />
              <span>1. Alur Kasir & Transaksi POS</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSelectedTopic('hpp')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              selectedTopic === 'hpp' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calculator className="w-4 h-4" />
              <span>2. Resep BOM & Kalkulator HPP</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSelectedTopic('inventory')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              selectedTopic === 'inventory' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className="w-4 h-4" />
              <span>3. Manajemen Stok & Opname</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSelectedTopic('printer')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              selectedTopic === 'printer' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Printer className="w-4 h-4" />
              <span>4. Printer Thermal & Barcode</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSelectedTopic('users')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              selectedTopic === 'users' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4" />
              <span>5. Multi-User & PIN Akses</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSelectedTopic('faq')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              selectedTopic === 'faq' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4" />
              <span>6. Tanya Jawab (FAQ)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          {selectedTopic === 'pos' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-base text-slate-900">Alur Standar Kasir & Transaksi POS</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <div>
                    <h3 className="font-bold text-emerald-950 text-sm mb-0.5">Buka Shift Kasir</h3>
                    <p className="text-emerald-800">Sebelum melayani pembeli, kasir wajib menekan tombol "Buka Kasir" di bilah atas atau sidebar. Masukkan modal uang kembalian di laci kasir (misal Rp 200.000).</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5">Memilih Produk Menu & Pesanan</h3>
                    <p className="text-slate-600">Klik kartu produk untuk menambahkan ke keranjang. Kasir dapat mengatur jumlah (qty), menambah catatan khusus (seperti "Less Sugar"), serta memilih tipe pesanan (Dine In / Meja, Take Away, atau Delivery).</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5">Metode Pembayaran Lengkap</h3>
                    <p className="text-slate-600">Tekan "Bayar / Checkout". Pilih metode bayar: Tunai (dengan tombol pecahan cepat & kalkulator kembalian), QRIS (tampil QR code otomatis), Transfer Bank, EDC Kartu, atau Kasbon Pelanggan.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5">Cetak Struk Thermal & Update Stok Otomatis</h3>
                    <p className="text-slate-600">Setelah pembayaran tervalidasi, struk thermal siap dicetak ke printer 58mm atau 80mm. Secara real-time, stok bahan baku penyusun resep produk akan langsung dipotong dari inventori toko.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'hpp' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-base text-slate-900">Perhitungan HPP & Bill of Materials (BOM)</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p>
                  KHP POS V4 dilengkapi dengan mesin kalkulasi HPP presisi tinggi berdasarkan komponen riil:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="font-extrabold text-slate-900 mb-1">1. Bahan Baku (Raw Material)</div>
                    <p className="text-slate-500">Biaya bahan per gram, per mililiter, atau per pcs yang digunakan dalam 1 porsi menu.</p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="font-extrabold text-slate-900 mb-1">2. Tenaga Kerja (Direct Labor)</div>
                    <p className="text-slate-500">Estimasi biaya pembuatan per porsi berdasarkan upah barista atau chef.</p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="font-extrabold text-slate-900 mb-1">3. Overhead & Packaging</div>
                    <p className="text-slate-500">Cup, tutup strawless, sedotan, paper bag, listrik, dan gas per porsi produk.</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                  <strong>Rumus Penetapan Harga:</strong> <br />
                  <span className="font-mono text-xs">Harga Saran = Total HPP / (1 - (Target Margin % / 100))</span> <br />
                  Gunakan tombol <strong>"Terapkan ke Menu POS"</strong> pada halaman Kalkulator HPP untuk langsung memperbarui harga jual di kasir tanpa input manual berulang.
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Boxes className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-base text-slate-900">Manajemen Stok & Audit Stok Opname</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p>
                  Sistem inventori KHP POS V4 memisahkan bahan baku (gram, ml, pcs) dan produk siap jual.
                </p>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Otomasi Potong Stok</h3>
                  <p className="text-slate-600">
                    Setiap kali kasir menyelesaikan transaksi segelas "Kopi Susu Gula Aren", stok Biji Kopi otomatis berkurang 18 gr, Susu UHT berkurang 120 ml, Gula Aren berkurang 25 ml, dan Cup berkurang 1 pcs.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Stok Opname Berkala</h3>
                  <p className="text-slate-600">
                    Pada menu Inventory atau Kasir, lakukan audit fisik berkala (mingguan/bulanan). Masukkan stok fisik riil yang ada di lemari/gudang, sistem akan menghitung selisih dan mencatat jurnal penyesuaian otomatis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'printer' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-base text-slate-900">Printer Thermal & Pemindai Barcode</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Koneksi Printer Thermal (58mm & 80mm)</h3>
                  <p className="text-slate-600">
                    Dukung semua printer thermal USB, Bluetooth, dan LAN (Epson, Panda, Kassen, Iware, Zywell, dll). Pada menu <strong>Pengaturan</strong>, pilih lebar kertas (58mm untuk printer kecil atau 80mm untuk ukuran standar resto). Aktifkan opsi <em>Auto-Print setelah bayar</em> jika diinginkan.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Pemindai Barcode / QR Code</h3>
                  <p className="text-slate-600">
                    Sistem mendeteksi pemindai barcode otomatis dengan 2 cara:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600">
                    <li><strong>Hardware Scanner USB / Bluetooth:</strong> Cukup tembakkan scanner ke barcode produk, produk otomatis masuk keranjang POS seketika tanpa perlu klik tombol apapun.</li>
                    <li><strong>Kamera HP / Laptop:</strong> Tekan tombol barcode scanner di kasir untuk membuka kamera internal perangkat.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-base text-slate-900">Hak Akses Multi-User (RBAC) & PIN Kasir</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Owner / Super Admin</span>
                    <p className="text-slate-600 mt-1">Akses tak terbatas ke seluruh laporan keuangan laba rugi, kalkulator HPP, pengaturan sistem, dan hak staf.</p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Manager Operasional</span>
                    <p className="text-slate-600 mt-1">Dapat mengelola inventori stok, kulakan pembelian, kalkulasi HPP resep, serta memonitor shift kasir.</p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Kasir (Front-Line)</span>
                    <p className="text-slate-600 mt-1">Fokus pada proses transaksi POS, buka/tutup shift kasir, dan cetak struk pelanggan.</p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Staff Dapur (Kitchen)</span>
                    <p className="text-slate-600 mt-1">Melihat tiket pesanan dapur, status produksi batch, serta cek ketersediaan stok bahan mentah.</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                  <strong>Ganti Shift Cepat:</strong> Klik avatar kasir di pojok kanan atas atau bagian bawah sidebar untuk membuka keypad PIN 4-digit instan tanpa perlu reload halaman.
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'faq' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-base text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Apakah data tersimpan jika browser ditutup?</h3>
                  <p className="text-slate-600">Ya, seluruh data produk, resep HPP, stok, transaksi, dan shift kasir tersimpan aman di penyimpanan lokal (localStorage) browser secara real-time. Anda juga dapat mengekspor cadangan JSON di menu Pengaturan.</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Bagaimana jika harga beli bahan baku naik?</h3>
                  <p className="text-slate-600">Cukup perbarui harga beli bahan baku di menu Master Bahan Baku atau saat mencatat Pembelian. Kalkulator HPP akan otomatis menghitung ulang modal resep semua produk yang menggunakan bahan tersebut.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
