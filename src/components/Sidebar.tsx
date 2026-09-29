import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard,
  ShoppingCart,
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
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  KeyRound,
  X,
  Search,
  CheckCircle2
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface MenuSection {
  title: string;
  items: {
    id: ActiveTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string | number;
  }[];
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    cart, 
    settings, 
    currentShift, 
    setIsShiftModalOpen, 
    setIsSwitchUserModalOpen,
    currentUser,
    lowStockItemsCount,
    isSidebarOpenMobile,
    setIsSidebarOpenMobile,
    isSidebarCollapsedDesktop,
    setIsSidebarCollapsedDesktop,
    setIsCommandPaletteOpen
  } = useApp();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const menuSections: MenuSection[] = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pos', label: 'POS / Kasir', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
      ],
    },
    {
      title: 'MASTER DATA',
      items: [
        { id: 'master_products', label: 'Master Produk', icon: Package },
        { id: 'master_ingredients', label: 'Master Bahan Baku', icon: Boxes },
        { id: 'customers', label: 'Pelanggan', icon: Users },
        { id: 'suppliers', label: 'Supplier', icon: Truck },
      ],
    },
    {
      title: 'PRODUKSI & HPP',
      items: [
        { id: 'bom_recipe', label: 'BOM / Resep', icon: ChefHat },
        { id: 'production', label: 'Produksi', icon: Factory },
        { id: 'hpp_calculator', label: 'Kalkulator HPP', icon: Calculator },
        { id: 'price_profitability', label: 'Harga & Profitabilitas', icon: TrendingUp },
      ],
    },
    {
      title: 'INVENTORY & TRANSAKSI',
      items: [
        { id: 'inventory_stock', label: 'Inventory (Stok)', icon: Warehouse, badge: lowStockItemsCount > 0 ? lowStockItemsCount : undefined },
        { id: 'purchases', label: 'Pembelian', icon: ShoppingBag },
        { id: 'discounts', label: 'Promo & Diskon', icon: Tag },
        { id: 'payments', label: 'Pembayaran', icon: CreditCard },
        { id: 'cash_shifts', label: 'Kas / Shift Kasir', icon: CircleDollarSign },
        { id: 'transaction_history', label: 'Riwayat Transaksi', icon: Receipt },
      ],
    },
    {
      title: 'ANALISIS & SISTEM',
      items: [
        { id: 'analysis_simulation', label: 'Analisis & Simulasi', icon: LineChart },
        { id: 'reports', label: 'Laporan', icon: BarChart3 },
      ],
    },
    {
      title: 'SISTEM',
      items: [
        { id: 'staff_users', label: 'Manajemen Staff', icon: UserCheck },
        { id: 'guide', label: 'Panduan', icon: BookOpen },
        { id: 'settings', label: 'Pengaturan', icon: Settings2 },
      ],
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsSidebarOpenMobile(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className={`p-3.5 border-b border-slate-200/90 flex items-center ${
        isSidebarCollapsedDesktop ? 'justify-center' : 'justify-between'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0 tracking-tight">
            K4
          </div>
          {!isSidebarCollapsedDesktop && (
            <div className="min-w-0">
              <div className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight flex items-center gap-1.5">
                <span>KHP POS</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SaaS V4
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-[11px] text-slate-500 truncate font-medium" title={settings.storeName}>
                  {settings.storeName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsSidebarOpenMobile(false)}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsedDesktop(prev => !prev)}
          className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          title={isSidebarCollapsedDesktop ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isSidebarCollapsedDesktop ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Quick Search Bar (when expanded) */}
      {!isSidebarCollapsedDesktop && (
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              setIsCommandPaletteOpen(true);
              setIsSidebarOpenMobile(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-200/90 bg-slate-50 hover:bg-slate-100/80 text-xs text-slate-500 transition-all shadow-2xs group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              <span className="truncate">Cari cepat...</span>
            </div>
            <kbd className="px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Cashier Shift Quick SaaS Pill */}
      {!isSidebarCollapsedDesktop && (
        <div className="px-3 pt-2">
          <button
            onClick={() => {
              setIsShiftModalOpen(true);
              setIsSidebarOpenMobile(false);
            }}
            className={`w-full p-2.5 rounded-xl border text-left transition-all ${
              currentShift
                ? 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950 hover:bg-emerald-100/70'
                : 'bg-amber-50/70 border-amber-200/90 text-amber-950 hover:bg-amber-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-bold">
                <span className={`w-2 h-2 rounded-full ${
                  currentShift ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`} />
                {currentShift ? 'Shift Kasir Aktif' : 'Kasir Tutup'}
              </span>
              <CircleDollarSign className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="font-mono font-bold text-xs tabular-nums">
              {currentShift ? formatRupiah(currentShift.expectedCash) : 'Buka Shift Baru'}
            </div>
          </button>
        </div>
      )}

      {/* Navigation List Organized in 6 Exact Groups */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-3.5">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            {!isSidebarCollapsedDesktop ? (
              <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
            ) : (
              <div className="h-px bg-slate-100 my-1.5 mx-1" />
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all relative group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  } ${isSidebarCollapsedDesktop ? 'justify-center px-1.5 py-2' : 'justify-between'}`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-white stroke-[2.2px]' : 'text-slate-500 group-hover:text-slate-900'
                    }`} />
                    {!isSidebarCollapsedDesktop && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {/* Badge */}
                  {!isSidebarCollapsedDesktop && item.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tabular-nums shrink-0 ${
                      isActive ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip for collapsed desktop */}
                  {isSidebarCollapsedDesktop && (
                    <div className="hidden group-hover:flex absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-md whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Profile Card */}
      <div className="p-2.5 border-t border-slate-200/90 bg-slate-50/70">
        <button
          onClick={() => {
            setIsSwitchUserModalOpen(true);
            setIsSidebarOpenMobile(false);
          }}
          className={`w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all text-left shadow-2xs ${
            isSidebarCollapsedDesktop ? 'justify-center p-2' : 'justify-between'
          }`}
          title="Klik untuk ganti user kasir (PIN)"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            {!isSidebarCollapsedDesktop && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize leading-tight mt-0.5">
                  {currentUser.role === 'admin' ? 'Owner / Admin' : currentUser.role}
                </div>
              </div>
            )}
          </div>

          {!isSidebarCollapsedDesktop && (
            <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside 
        className={`hidden md:flex flex-col border-r border-slate-200/90 bg-white transition-all duration-200 shrink-0 z-30 ${
          isSidebarCollapsedDesktop ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={() => setIsSidebarOpenMobile(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
