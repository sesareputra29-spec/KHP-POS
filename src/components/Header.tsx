import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu,
  Clock, 
  CircleDollarSign, 
  KeyRound, 
  Maximize2, 
  Minimize2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Search,
  Sparkles
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    settings, 
    currentShift, 
    setIsShiftModalOpen, 
    setIsSwitchUserModalOpen,
    lowStockItemsCount,
    setActiveTab,
    activeTab,
    setIsSidebarOpenMobile,
    setIsCommandPaletteOpen
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const getTabCategoryAndTitle = (tab: string): { category: string; title: string } => {
    switch (tab) {
      // UTAMA
      case 'dashboard': return { category: 'Utama', title: 'Dashboard' };
      case 'pos': return { category: 'Utama', title: 'POS / Kasir' };
      // MASTER DATA
      case 'master_products': return { category: 'Master Data', title: 'Master Produk' };
      case 'master_ingredients': return { category: 'Master Data', title: 'Master Bahan Baku' };
      case 'customers': return { category: 'Master Data', title: 'Pelanggan' };
      case 'suppliers': return { category: 'Master Data', title: 'Supplier' };
      // PRODUKSI & HPP
      case 'bom_recipe': return { category: 'Produksi & HPP', title: 'BOM / Resep' };
      case 'production': return { category: 'Produksi & HPP', title: 'Produksi' };
      case 'hpp_calculator': 
      case 'hpp': return { category: 'Produksi & HPP', title: 'Kalkulator HPP' };
      case 'price_profitability': return { category: 'Produksi & HPP', title: 'Harga & Profitabilitas' };
      // INVENTORY & TRANSAKSI
      case 'inventory_stock': 
      case 'inventory': return { category: 'Inventory & Transaksi', title: 'Inventory (Stok)' };
      case 'purchases': return { category: 'Inventory & Transaksi', title: 'Pembelian' };
      case 'discounts': return { category: 'Inventory & Transaksi', title: 'Promo & Diskon' };
      case 'payments': return { category: 'Inventory & Transaksi', title: 'Pembayaran' };
      case 'cash_shifts': return { category: 'Inventory & Transaksi', title: 'Kas / Shift Kasir' };
      case 'transaction_history': return { category: 'Inventory & Transaksi', title: 'Riwayat Transaksi' };
      // ANALISIS & SISTEM
      case 'analysis_simulation': return { category: 'Analisis & Sistem', title: 'Analisis & Simulasi' };
      case 'reports': return { category: 'Analisis & Sistem', title: 'Laporan' };
      // SISTEM
      case 'staff_users': 
      case 'users': return { category: 'Sistem', title: 'Manajemen Staff' };
      case 'guide': return { category: 'Sistem', title: 'Panduan' };
      case 'settings': return { category: 'Sistem', title: 'Pengaturan' };
      default: return { category: 'Sistem', title: 'KHP POS V4' };
    }
  };

  const { category, title } = getTabCategoryAndTitle(activeTab);

  return (
    <header className="h-15 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-20">
      {/* Left Zone: Hamburger + Breadcrumb Trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsSidebarOpenMobile(true)}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Contextual Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs truncate">
          <span className="hidden sm:inline-block font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
            {category}
          </span>
          <ChevronRight className="hidden sm:inline-block w-3.5 h-3.5 text-slate-300 shrink-0" />
          <h1 className="font-bold text-slate-900 text-sm tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle Zone: Sleek Command Palette Search Trigger */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 text-xs text-slate-500 transition-all shadow-2xs group"
          title="Buka Command Palette (⌘K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            <span className="truncate">Cari menu, produk, resep, atau aksi...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Zone: Status Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          title="Cari"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Live Date & Time Display */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
          <span className="text-slate-300">·</span>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono tabular-nums text-slate-900 font-semibold">{currentTime}</span>
        </div>

        {/* Low Stock Warning Pill */}
        {lowStockItemsCount > 0 && (
          <button
            onClick={() => setActiveTab('inventory_stock')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors shadow-2xs"
            title={`${lowStockItemsCount} bahan/produk stok menipis!`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-mono tabular-nums">{lowStockItemsCount} Menipis</span>
          </button>
        )}

        {/* Shift Cashier Status Pill */}
        <button
          onClick={() => setIsShiftModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all shadow-2xs ${
            currentShift
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
          }`}
          title="Status Kasir"
        >
          <span className={`w-2 h-2 rounded-full ${currentShift ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="hidden sm:inline font-mono tabular-nums">
            {currentShift ? `Kasir (${formatRupiah(currentShift.expectedCash)})` : 'Buka Kasir'}
          </span>
          <span className="sm:hidden">
            {currentShift ? 'Kasir' : 'Tutup'}
          </span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="Mode Layar Penuh"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* User Account & Quick PIN Switch */}
        <button
          onClick={() => setIsSwitchUserModalOpen(true)}
          className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs text-left"
          title="Klik untuk ganti user kasir (PIN)"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser.name.split(' ')[0]}
            </div>
            <div className="text-[10px] text-slate-500 capitalize leading-tight">
              {currentUser.role}
            </div>
          </div>
          <KeyRound className="w-3 h-3 text-slate-400 ml-0.5" />
        </button>
      </div>
    </header>
  );
};
