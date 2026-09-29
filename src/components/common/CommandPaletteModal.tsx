import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { 
  Search, 
  X, 
  ArrowRight, 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Users, 
  Truck, 
  ChefHat, 
  Factory, 
  Calculator, 
  TrendingUp, 
  Warehouse, 
  ShoppingBag, 
  Tag, 
  CreditCard, 
  CircleDollarSign, 
  Receipt, 
  LineChart, 
  BarChart3, 
  UserCheck, 
  BookOpen, 
  Settings2,
  Barcode,
  KeyRound,
  Download,
  SlidersHorizontal,
  Maximize2
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface SearchItem {
  id: string;
  type: 'navigation' | 'action' | 'product' | 'ingredient';
  title: string;
  subtitle: string;
  category?: string;
  icon: React.FC<{ className?: string }>;
  action: () => void;
}

export const CommandPaletteModal: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setActiveTab, 
    products, 
    ingredients, 
    setIsShiftModalOpen, 
    setIsSwitchUserModalOpen,
    setIsBarcodeScannerOpen,
    exportDataJson
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // All 20 Nav items + Quick Actions + Products + Ingredients
  const allItems: SearchItem[] = useMemo(() => {
    const navItems: SearchItem[] = [
      // UTAMA
      { id: 'nav-dashboard', type: 'navigation', title: 'Dashboard Utama', subtitle: 'Ringkasan omset, profitabilitas & performa kasir', category: 'UTAMA', icon: LayoutDashboard, action: () => setActiveTab('dashboard') },
      { id: 'nav-pos', type: 'navigation', title: 'POS / Kasir & Transaksi', subtitle: 'Kasir kilat, checkout tunai, QRIS, & diskon', category: 'UTAMA', icon: ShoppingCart, action: () => setActiveTab('pos') },
      
      // MASTER DATA
      { id: 'nav-products', type: 'navigation', title: 'Master Produk & Menu', subtitle: 'Daftar produk, barcode, varian, dan harga jual', category: 'MASTER DATA', icon: Package, action: () => setActiveTab('master_products') },
      { id: 'nav-ingredients', type: 'navigation', title: 'Master Bahan Baku', subtitle: 'Database bahan mentah, stok minimum & harga beli', category: 'MASTER DATA', icon: Boxes, action: () => setActiveTab('master_ingredients') },
      { id: 'nav-customers', type: 'navigation', title: 'Pelanggan & CRM', subtitle: 'Database pelanggan, kasbon/tempo & loyalitas', category: 'MASTER DATA', icon: Users, action: () => setActiveTab('customers') },
      { id: 'nav-suppliers', type: 'navigation', title: 'Supplier & Vendor', subtitle: 'Kontak pemasok bahan baku & riwayat tempo', category: 'MASTER DATA', icon: Truck, action: () => setActiveTab('suppliers') },
      
      // PRODUKSI & HPP
      { id: 'nav-bom', type: 'navigation', title: 'BOM / Resep Racikan', subtitle: 'Formula takaran bahan per porsi & batch', category: 'PRODUKSI & HPP', icon: ChefHat, action: () => setActiveTab('bom_recipe') },
      { id: 'nav-production', type: 'navigation', title: 'Produksi Batch Dapur', subtitle: 'Catat produksi & auto-potong stok bahan', category: 'PRODUKSI & HPP', icon: Factory, action: () => setActiveTab('production') },
      { id: 'nav-hpp', type: 'navigation', title: 'Kalkulator HPP & Costing', subtitle: 'Kalkulasi HPP food cost, overhead & target margin', category: 'PRODUKSI & HPP', icon: Calculator, action: () => setActiveTab('hpp_calculator') },
      { id: 'nav-price', type: 'navigation', title: 'Harga & Profitabilitas', subtitle: 'Analisis margin kotor & penentuan harga jual', category: 'PRODUKSI & HPP', icon: TrendingUp, action: () => setActiveTab('price_profitability') },
      
      // INVENTORY & TRANSAKSI
      { id: 'nav-stock', type: 'navigation', title: 'Inventory (Stok)', subtitle: 'Monitoring stok gudang, alert kritis & opname', category: 'INVENTORY & TRANSAKSI', icon: Warehouse, action: () => setActiveTab('inventory_stock') },
      { id: 'nav-purchases', type: 'navigation', title: 'Pembelian & Kulakan', subtitle: 'Input faktur restock supplier & biaya beli', category: 'INVENTORY & TRANSAKSI', icon: ShoppingBag, action: () => setActiveTab('purchases') },
      { id: 'nav-discounts', type: 'navigation', title: 'Promo & Diskon Voucher', subtitle: 'Kupon persen, nominal, dan promo otomatis', category: 'INVENTORY & TRANSAKSI', icon: Tag, action: () => setActiveTab('discounts') },
      { id: 'nav-payments', type: 'navigation', title: 'Metode Pembayaran', subtitle: 'Konfigurasi Kas, QRIS, Transfer Bank, EDC & Tempo', category: 'INVENTORY & TRANSAKSI', icon: CreditCard, action: () => setActiveTab('payments') },
      { id: 'nav-shifts', type: 'navigation', title: 'Kas & Shift Kasir', subtitle: 'Status laci kasir real-time, modal awal & tutup shift', category: 'INVENTORY & TRANSAKSI', icon: CircleDollarSign, action: () => setActiveTab('cash_shifts') },
      { id: 'nav-history', type: 'navigation', title: 'Riwayat Transaksi', subtitle: 'Arsip seluruh nota penjualan & cetak ulang struk', category: 'INVENTORY & TRANSAKSI', icon: Receipt, action: () => setActiveTab('transaction_history') },
      
      // ANALISIS & SISTEM
      { id: 'nav-analysis', type: 'navigation', title: 'Analisis BEP & Simulasi', subtitle: 'Kalkulator Break Even Point & simulasi skenario HPP', category: 'ANALISIS & SISTEM', icon: LineChart, action: () => setActiveTab('analysis_simulation') },
      { id: 'nav-reports', type: 'navigation', title: 'Laporan Keuangan', subtitle: 'Laba Rugi, Cashflow, dan performa per kasir', category: 'ANALISIS & SISTEM', icon: BarChart3, action: () => setActiveTab('reports') },
      
      // SISTEM
      { id: 'nav-staff', type: 'navigation', title: 'Manajemen Staff & PIN', subtitle: 'Multi-user role Admin, Manager, Kasir, Kitchen', category: 'SISTEM', icon: UserCheck, action: () => setActiveTab('staff_users') },
      { id: 'nav-guide', type: 'navigation', title: 'Panduan Sistem (SOP)', subtitle: 'Dokumentasi lengkap alur kerja KHP POS V4', category: 'SISTEM', icon: BookOpen, action: () => setActiveTab('guide') },
      { id: 'nav-settings', type: 'navigation', title: 'Pengaturan & Satuan/Kategori', subtitle: 'Identitas toko, pajak PB1, printer thermal, satuan & kategori', category: 'SISTEM', icon: Settings2, action: () => setActiveTab('settings') },
    ];

    const quickActions: SearchItem[] = [
      {
        id: 'act-shift',
        type: 'action',
        title: 'Buka / Tutup Shift Kasir',
        subtitle: 'Atur modal awal laci atau hitung uang fisik tutup kasir',
        category: 'Aksi Cepat',
        icon: CircleDollarSign,
        action: () => setIsShiftModalOpen(true),
      },
      {
        id: 'act-switch-user',
        type: 'action',
        title: 'Ganti User Kasir (PIN Cepat)',
        subtitle: 'Login kasir dengan PIN 4-digit tanpa logout total',
        category: 'Aksi Cepat',
        icon: KeyRound,
        action: () => setIsSwitchUserModalOpen(true),
      },
      {
        id: 'act-barcode',
        type: 'action',
        title: 'Pemindai Barcode Kamera',
        subtitle: 'Scan barcode produk menggunakan kamera perangkat',
        category: 'Aksi Cepat',
        icon: Barcode,
        action: () => setIsBarcodeScannerOpen(true),
      },
      {
        id: 'act-settings-units',
        type: 'action',
        title: 'Kelola Satuan & Kategori Menu',
        subtitle: 'Tambah, ubah, atau hapus jenis satuan dan kategori',
        category: 'Aksi Cepat',
        icon: SlidersHorizontal,
        action: () => setActiveTab('settings'),
      },
      {
        id: 'act-export',
        type: 'action',
        title: 'Download Backup JSON Database',
        subtitle: 'Simpan seluruh data resep, produk, stok dan transaksi',
        category: 'Aksi Cepat',
        icon: Download,
        action: () => {
          const json = exportDataJson();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup_khp_pos_${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
        },
      },
      {
        id: 'act-fullscreen',
        type: 'action',
        title: 'Toggle Fullscreen Mode',
        subtitle: 'Maksimalkan tampilan kasir ke mode layar penuh',
        category: 'Aksi Cepat',
        icon: Maximize2,
        action: () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        },
      },
    ];

    // Products
    const productItems: SearchItem[] = products.map(p => ({
      id: `prod-${p.id}`,
      type: 'product',
      title: p.name,
      subtitle: `${formatRupiah(p.price)} · Stok: ${p.currentStock} · Kategori: ${p.categoryName || 'Umum'}`,
      category: 'Produk Menu',
      icon: Package,
      action: () => {
        setActiveTab('master_products');
      },
    }));

    // Ingredients
    const ingredientItems: SearchItem[] = ingredients.map(i => ({
      id: `ing-${i.id}`,
      type: 'ingredient',
      title: i.name,
      subtitle: `Stok: ${i.currentStock} ${i.unit} (Min: ${i.minStock}) · Biaya: ${formatRupiah(i.costPerUnit)}/${i.unit}`,
      category: 'Bahan Baku',
      icon: Boxes,
      action: () => {
        setActiveTab('master_ingredients');
      },
    }));

    return [...navItems, ...quickActions, ...productItems, ...ingredientItems];
  }, [products, ingredients, setActiveTab, setIsShiftModalOpen, setIsSwitchUserModalOpen, setIsBarcodeScannerOpen, exportDataJson]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Show default top shortcuts: Utamanya 6 menu utama + 4 aksi cepat
      return allItems.slice(0, 14);
    }
    const cleanQuery = query.toLowerCase().trim();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(cleanQuery) ||
      item.subtitle.toLowerCase().includes(cleanQuery) ||
      (item.category && item.category.toLowerCase().includes(cleanQuery))
    ).slice(0, 20); // Cap at 20 most relevant results
  }, [allItems, query]);

  // Handle keyboard arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        setIsCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    }
  };

  const handleSelectItem = (item: SearchItem) => {
    item.action();
    setIsCommandPaletteOpen(false);
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 select-none">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCommandPaletteOpen(false)}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div 
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Header Input */}
        <div className="p-3.5 border-b border-slate-200/90 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Cari menu, produk, bahan, atau aksi cepat..."
            className="flex-1 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 bg-transparent outline-hidden"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
                ESC
              </kbd>
            </div>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-700">Tidak ada hasil ditemukan</p>
              <p className="mt-1 text-slate-500">Coba kata kunci lain seperti "Kasir", "HPP", "Kopi", "Gula", dll.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-xs ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'hover:bg-slate-100/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-emerald-700/80 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {item.title}
                          </span>
                          {item.category && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isSelected ? 'bg-emerald-800/80 text-emerald-100' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {item.category}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 opacity-0 transition-opacity ${
                      isSelected ? 'opacity-100 text-white' : ''
                    }`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard Hints Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded">↓</kbd>
              <span>Navigasi</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded">↵</kbd>
              <span>Pilih</span>
            </span>
          </div>

          <div className="text-[10px] text-slate-400 hidden sm:block">
            <span>KHP POS V4 · Enterprise SaaS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
