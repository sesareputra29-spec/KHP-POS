import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { 
  ShoppingCart, 
  Calculator, 
  Boxes, 
  UtensilsCrossed, 
  BarChart3, 
  Users2, 
  Settings2 
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  permission?: 'pos' | 'hpp_calculator' | 'stock' | 'ingredients' | 'products' | 'reports' | 'users' | 'settings';
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, hasPermission, cart } = useApp();

  const navItems: NavItem[] = [
    { id: 'pos', label: 'Kasir POS', shortLabel: 'Kasir', icon: ShoppingCart, permission: 'pos' },
    { id: 'hpp_calculator', label: 'Kalkulator HPP', shortLabel: 'HPP', icon: Calculator, permission: 'hpp_calculator' },
    { id: 'inventory_stock', label: 'Bahan & Stok', shortLabel: 'Stok', icon: Boxes, permission: 'stock' },
    { id: 'master_products', label: 'Menu Produk', shortLabel: 'Menu', icon: UtensilsCrossed, permission: 'products' },
    { id: 'reports', label: 'Laporan Keuangan', shortLabel: 'Laporan', icon: BarChart3, permission: 'reports' },
    { id: 'staff_users', label: 'Akses User', shortLabel: 'User', icon: Users2, permission: 'users' },
    { id: 'settings', label: 'Pengaturan', shortLabel: 'Setelan', icon: Settings2, permission: 'settings' },
  ];

  // Filter based on user permissions
  const visibleItems = navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Desktop Top Sub-Header Navigation Bar */}
      <nav className="hidden md:flex items-center gap-1.5 px-6 py-2 bg-neutral-100 border-b border-neutral-200 overflow-x-auto scrollbar-none select-none">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.id === 'pos' && cartItemsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono tabular-nums ${
                  isActive ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
                }`}>
                  {cartItemsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-2 py-1.5 flex items-center justify-around select-none">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors relative min-w-[48px] ${
                isActive ? 'text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {item.id === 'pos' && cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-neutral-900 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{item.shortLabel}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-neutral-900 absolute bottom-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
