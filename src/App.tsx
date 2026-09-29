import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// UTAMA
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';

// MASTER DATA
import { ProductsView } from './components/products/ProductsView';
import { MasterIngredientsView } from './components/master/MasterIngredientsView';
import { CustomersView } from './components/master/CustomersView';
import { SuppliersView } from './components/master/SuppliersView';

// PRODUKSI & HPP
import { BomRecipeView } from './components/production/BomRecipeView';
import { ProductionView } from './components/production/ProductionView';
import { HppCalculatorView } from './components/hpp/HppCalculatorView';
import { PriceProfitabilityView } from './components/production/PriceProfitabilityView';

// INVENTORY & TRANSAKSI
import { InventoryStockView } from './components/inventory/InventoryStockView';
import { PurchasesView } from './components/transactions/PurchasesView';
import { DiscountsView } from './components/transactions/DiscountsView';
import { PaymentsView } from './components/transactions/PaymentsView';
import { CashShiftsView } from './components/transactions/CashShiftsView';
import { TransactionHistoryView } from './components/transactions/TransactionHistoryView';

// ANALISIS & SISTEM
import { AnalysisSimulationView } from './components/analysis/AnalysisSimulationView';
import { ReportsView } from './components/reports/ReportsView';

// SISTEM
import { UsersView } from './components/users/UsersView';
import { GuideView } from './components/system/GuideView';
import { SettingsView } from './components/settings/SettingsView';

// Global Modals
import { QuickPinSwitchModal } from './components/common/QuickPinSwitchModal';
import { ShiftModal } from './components/pos/ShiftModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { BarcodeScannerModal } from './components/pos/BarcodeScannerModal';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';

const MainAppContent: React.FC = () => {
  const { activeTab, receiptModalTransaction, isBarcodeScannerOpen } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      {/* Permanent Desktop & Responsive Mobile Clean Bright Sidebar */}
      <Sidebar />

      {/* Main Content Area (Header + Viewport) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        <Header />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* UTAMA */}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'pos' && <PosView />}

          {/* MASTER DATA */}
          {(activeTab === 'master_products' || (activeTab as string) === 'products') && <ProductsView />}
          {activeTab === 'master_ingredients' && <MasterIngredientsView />}
          {activeTab === 'customers' && <CustomersView />}
          {activeTab === 'suppliers' && <SuppliersView />}

          {/* PRODUKSI & HPP */}
          {activeTab === 'bom_recipe' && <BomRecipeView />}
          {activeTab === 'production' && <ProductionView />}
          {(activeTab === 'hpp_calculator' || (activeTab as string) === 'hpp') && <HppCalculatorView />}
          {activeTab === 'price_profitability' && <PriceProfitabilityView />}

          {/* INVENTORY & TRANSAKSI */}
          {(activeTab === 'inventory_stock' || (activeTab as string) === 'inventory') && <InventoryStockView />}
          {activeTab === 'purchases' && <PurchasesView />}
          {activeTab === 'discounts' && <DiscountsView />}
          {activeTab === 'payments' && <PaymentsView />}
          {activeTab === 'cash_shifts' && <CashShiftsView />}
          {activeTab === 'transaction_history' && <TransactionHistoryView />}

          {/* ANALISIS & SISTEM */}
          {activeTab === 'analysis_simulation' && <AnalysisSimulationView />}
          {activeTab === 'reports' && <ReportsView />}

          {/* SISTEM */}
          {(activeTab === 'staff_users' || (activeTab as string) === 'users') && <UsersView />}
          {activeTab === 'guide' && <GuideView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <QuickPinSwitchModal />
      <ShiftModal />
      {receiptModalTransaction && <ReceiptModal />}
      {isBarcodeScannerOpen && <BarcodeScannerModal />}
      <CommandPaletteModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
