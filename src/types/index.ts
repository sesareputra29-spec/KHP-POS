export type UserRole = 'admin' | 'manager' | 'cashier' | 'kitchen';

export type ActiveTab = 
  // UTAMA
  | 'dashboard'
  | 'pos'
  // MASTER DATA
  | 'master_products'
  | 'master_ingredients'
  | 'customers'
  | 'suppliers'
  // PRODUKSI & HPP
  | 'bom_recipe'
  | 'production'
  | 'hpp_calculator'
  | 'price_profitability'
  // INVENTORY & TRANSAKSI
  | 'inventory_stock'
  | 'purchases'
  | 'discounts'
  | 'payments'
  | 'cash_shifts'
  | 'transaction_history'
  // ANALISIS & SISTEM
  | 'analysis_simulation'
  | 'reports'
  // SISTEM
  | 'staff_users'
  | 'guide'
  | 'settings';

export type Permission = 
  | 'pos' 
  | 'hpp_calculator' 
  | 'products' 
  | 'ingredients' 
  | 'stock' 
  | 'purchases' 
  | 'reports' 
  | 'users' 
  | 'settings';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  transactionsCount: number;
  outstandingCredit: number; // Kasbon/tempo
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  itemsSupplied: string[];
  totalPurchases: number;
}

export interface PromoDiscount {
  id: string;
  name: string;
  code: string;
  type: 'percent' | 'nominal';
  value: number;
  minPurchase: number;
  active: boolean;
  notes?: string;
}

export interface ProductionBatch {
  id: string;
  batchNumber: string;
  timestamp: number;
  productId: string;
  productName: string;
  quantityProduced: number;
  totalCogs: number;
  staffName: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  pin: string; // 4-6 digit quick PIN
  role: UserRole;
  permissions: Permission[];
  phone?: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type?: 'product' | 'ingredient' | 'general';
  iconName?: string;
  description?: string;
}

export interface UnitItem {
  id: string;
  name: string;
  code: string;
  category?: string;
  description?: string;
}

export type UnitType = string;

export interface Ingredient {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: UnitType;
  currentStock: number;
  minStock: number;
  costPerUnit: number; // Cost in IDR for 1 unit (e.g. per gram or per ml)
  purchaseUnit?: string; // e.g. "Sak 25kg" or "Karton 12 Liter"
  purchaseConversion?: number; // e.g. 1 Sak = 25000 gr
  supplierName?: string;
  updatedAt: number;
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: UnitType;
  costCalculated: number; // quantity * ingredient.costPerUnit
}

export interface OverheadCost {
  id: string;
  name: string;
  amount: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  price: number;
  
  // HPP / COGS calculation details
  hasRecipe: boolean;
  recipe: RecipeItem[];
  directLaborCost: number;
  overheads: OverheadCost[];
  cogs: number; // Total HPP = raw materials + direct labor + overheads
  targetMarginPercent: number; // e.g. 50%
  suggestedPrice: number;
  
  // Inventory tracking
  trackStock: boolean; // if false, stock is determined by raw materials
  currentStock: number;
  minStock: number;
  
  description?: string;
  imageUrl?: string;
  active: boolean;
}

export interface CartItem {
  id: string; // unique item cart row ID
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  cogs: number;
  note?: string;
  discountAmount: number; // per item discount in Rp
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'card' | 'credit';

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  cogs: number;
  quantity: number;
  subtotal: number;
  note?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: number;
  cashierId: string;
  cashierName: string;
  shiftId: string;
  orderType: 'dine_in' | 'take_away' | 'delivery';
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  
  items: TransactionItem[];
  subtotal: number;
  discountTotal: number;
  taxPercent: number;
  taxAmount: number;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  total: number;
  
  // Financial metrics
  totalCogs: number; // Total HPP modal
  grossProfit: number; // (Total - Tax - Service) - TotalCogs
  
  paymentMethod: PaymentMethod;
  paymentDetails: {
    cashGiven?: number;
    change?: number;
    referenceNumber?: string;
    bankName?: string;
    dueDate?: string; // For tempo/credit
  };
  status: 'completed' | 'cancelled';
}

export interface CashierShift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: number;
  endTime?: number;
  startingCash: number;
  totalCashSales: number;
  totalNonCashSales: number;
  cashIn: number; // Petty cash added
  cashOut: number; // Petty cash removed
  expectedCash: number;
  actualCashCounted?: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export type StockMovementType = 'sale' | 'restock' | 'opname' | 'waste' | 'production_adjust';

export interface StockMovement {
  id: string;
  timestamp: number;
  type: StockMovementType;
  referenceId?: string; // invoice # or PO #
  itemId: string;
  itemType: 'product' | 'ingredient';
  itemName: string;
  changeQty: number; // positive or negative
  previousStock: number;
  newStock: number;
  unit: string;
  notes?: string;
  staffName: string;
}

export interface PurchaseOrder {
  id: string;
  invoiceNumber: string;
  date: string;
  supplierName: string;
  items: {
    itemType: 'product' | 'ingredient';
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    subtotal: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
  createdAt: number;
}

export interface Expense {
  id: string;
  date: string;
  category: 'Sewa Tempat' | 'Listrik & Air' | 'Gaji Karyawan' | 'Pemasaran' | 'Perlengkapan & Operasional' | 'Lain-lain';
  description: string;
  amount: number;
  recordedBy: string;
  createdAt: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  taxPercent: number;
  enableTax: boolean;
  serviceChargePercent: number;
  enableServiceCharge: boolean;
  receiptPaperSize: '58mm' | '80mm';
  autoPrintReceipt: boolean;
  printKitchenTicket: boolean;
  receiptFooterMessage: string;
  currencySymbol: string;
  fixedMonthlyOverhead: number; // For BEP calculation
}
