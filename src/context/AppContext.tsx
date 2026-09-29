import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Category, 
  Ingredient, 
  Product, 
  CartItem, 
  Transaction, 
  CashierShift, 
  StockMovement, 
  Expense, 
  StoreSettings, 
  Permission, 
  PaymentMethod, 
  RecipeItem, 
  OverheadCost,
  ActiveTab,
  Customer,
  Supplier,
  PromoDiscount,
  ProductionBatch,
  UnitItem
} from '../types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_USERS, 
  INITIAL_CATEGORIES, 
  INITIAL_INGREDIENTS, 
  INITIAL_PRODUCTS, 
  INITIAL_SHIFT, 
  INITIAL_TRANSACTIONS, 
  INITIAL_STOCK_MOVEMENTS, 
  INITIAL_EXPENSES,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_PROMOS,
  INITIAL_PRODUCTION_BATCHES,
  INITIAL_UNITS
} from '../data/initialData';
import { generateInvoiceNumber } from '../utils/formatters';

interface AppContextType {
  // Navigation & UI State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Auth & Roles
  currentUser: User;
  users: User[];
  hasPermission: (permission: Permission) => boolean;
  switchUser: (pin: string) => boolean;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (params: string | { name: string; type?: 'product' | 'ingredient' | 'general'; description?: string }) => void;
  updateCategory: (id: string, params: string | { name: string; type?: 'product' | 'ingredient' | 'general'; description?: string }) => void;
  deleteCategory: (id: string) => void;

  // Units / Satuan
  units: UnitItem[];
  addUnit: (unit: Omit<UnitItem, 'id'>) => void;
  updateUnit: (id: string, unit: Partial<UnitItem>) => void;
  deleteUnit: (id: string) => void;

  // Customers & Suppliers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'totalSpent' | 'transactionsCount'>) => void;
  updateCustomer: (cust: Customer) => void;
  deleteCustomer: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (sup: Omit<Supplier, 'id' | 'totalPurchases'>) => void;
  updateSupplier: (sup: Supplier) => void;
  deleteSupplier: (id: string) => void;

  // Promos & Discounts
  promos: PromoDiscount[];
  addPromo: (promo: Omit<PromoDiscount, 'id'>) => void;
  updatePromo: (promo: PromoDiscount) => void;
  deletePromo: (id: string) => void;

  // Production Batches
  productionBatches: ProductionBatch[];
  recordProductionBatch: (params: {
    productId: string;
    quantityProduced: number;
    notes?: string;
  }) => boolean;

  // Ingredients (Bahan Baku)
  ingredients: Ingredient[];
  addIngredient: (ing: Omit<Ingredient, 'id' | 'updatedAt'>) => void;
  updateIngredient: (ing: Ingredient) => void;
  deleteIngredient: (id: string) => void;

  // Products & Menu
  products: Product[];
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (prod: Product) => void;
  deleteProduct: (id: string) => void;
  applyHppToProduct: (productId: string, hppData: {
    recipe: RecipeItem[];
    directLaborCost: number;
    overheads: OverheadCost[];
    cogs: number;
    targetMarginPercent: number;
    suggestedPrice: number;
    price?: number;
  }) => void;

  // Cart & POS
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQty: (cartItemId: string, qty: number) => void;
  updateCartItemNote: (cartItemId: string, note: string) => void;
  updateCartItemDiscount: (cartItemId: string, discount: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTaxAmount: number;
  cartServiceAmount: number;
  cartDiscountTotal: number;
  cartTotal: number;

  // Checkout & Transactions
  transactions: Transaction[];
  checkout: (params: {
    paymentMethod: PaymentMethod;
    cashGiven?: number;
    orderType: 'dine_in' | 'take_away' | 'delivery';
    tableNumber?: string;
    customerName?: string;
    customerPhone?: string;
    discountTotal?: number;
    bankName?: string;
    referenceNumber?: string;
    dueDate?: string;
  }) => Transaction;
  receiptModalTransaction: Transaction | null;
  setReceiptModalTransaction: (trx: Transaction | null) => void;

  // Shift & Cash Drawer
  currentShift: CashierShift | null;
  shiftsHistory: CashierShift[];
  startShift: (startingCash: number, notes?: string) => void;
  recordPettyCash: (type: 'in' | 'out', amount: number, notes: string) => void;
  closeShift: (actualCash: number, notes?: string) => void;

  // Inventory & Stock Movements
  stockMovements: StockMovement[];
  performStockOpname: (itemId: string, itemType: 'product' | 'ingredient', actualStock: number, notes: string) => void;
  recordRestock: (params: {
    itemId: string;
    itemType: 'product' | 'ingredient';
    addedQty: number;
    costPerUnit?: number;
    supplierName?: string;
    totalAmount: number;
    notes?: string;
  }) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (exp: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (settings: Partial<StoreSettings>) => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  resetAllData: () => void;

  // Modals & Triggers
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isBarcodeScannerOpen: boolean;
  setIsBarcodeScannerOpen: (open: boolean) => void;
  isShiftModalOpen: boolean;
  setIsShiftModalOpen: (open: boolean) => void;
  isSwitchUserModalOpen: boolean;
  setIsSwitchUserModalOpen: (open: boolean) => void;
  isSidebarOpenMobile: boolean;
  setIsSidebarOpenMobile: (open: boolean) => void;
  isSidebarCollapsedDesktop: boolean;
  setIsSidebarCollapsedDesktop: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  lowStockItemsCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'KHP_POS_V4_STORAGE_STATE';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or default
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_USERS`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => users[0] || INITIAL_USERS[0]);

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CATEGORIES`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [units, setUnits] = useState<UnitItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_UNITS`);
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CUSTOMERS`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SUPPLIERS`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [promos, setPromos] = useState<PromoDiscount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_PROMOS`);
    return saved ? JSON.parse(saved) : INITIAL_PROMOS;
  });

  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_BATCHES`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_BATCHES;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_INGREDIENTS`);
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_PRODUCTS`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_TRANSACTIONS`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [currentShift, setCurrentShift] = useState<CashierShift | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CURRENT_SHIFT`);
    return saved ? JSON.parse(saved) : INITIAL_SHIFT;
  });

  const [shiftsHistory, setShiftsHistory] = useState<CashierShift[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SHIFTS_HISTORY`);
    return saved ? JSON.parse(saved) : [];
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_STOCK_MOVEMENTS`);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_EXPENSES`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SETTINGS`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Modal & Sidebar States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [receiptModalTransaction, setReceiptModalTransaction] = useState<Transaction | null>(null);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsedDesktop, setIsSidebarCollapsedDesktop] = useState(false);

  // Global Command Palette Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_USERS`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_CATEGORIES`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_UNITS`, JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_INGREDIENTS`, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_PRODUCTS`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_TRANSACTIONS`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_CURRENT_SHIFT`, JSON.stringify(currentShift));
  }, [currentShift]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_SHIFTS_HISTORY`, JSON.stringify(shiftsHistory));
  }, [shiftsHistory]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_STOCK_MOVEMENTS`, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_EXPENSES`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_CUSTOMERS`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_SUPPLIERS`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_PROMOS`, JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_BATCHES`, JSON.stringify(productionBatches));
  }, [productionBatches]);

  // Customers CRUD
  const addCustomer = (cust: Omit<Customer, 'id' | 'totalSpent' | 'transactionsCount'>) => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
      transactionsCount: 0,
    };
    setCustomers(prev => [newCust, ...prev]);
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Suppliers CRUD
  const addSupplier = (sup: Omit<Supplier, 'id' | 'totalPurchases'>) => {
    const newSup: Supplier = {
      ...sup,
      id: `sup-${Date.now()}`,
      totalPurchases: 0,
    };
    setSuppliers(prev => [newSup, ...prev]);
  };

  const updateSupplier = (updated: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Promos CRUD
  const addPromo = (promo: Omit<PromoDiscount, 'id'>) => {
    const newPromo: PromoDiscount = {
      ...promo,
      id: `prm-${Date.now()}`,
    };
    setPromos(prev => [newPromo, ...prev]);
  };

  const updatePromo = (updated: PromoDiscount) => {
    setPromos(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deletePromo = (id: string) => {
    setPromos(prev => prev.filter(p => p.id !== id));
  };

  // Production Batches
  const recordProductionBatch = (params: {
    productId: string;
    quantityProduced: number;
    notes?: string;
  }): boolean => {
    const prod = products.find(p => p.id === params.productId);
    if (!prod || params.quantityProduced <= 0) return false;

    const batchNumber = generateInvoiceNumber('BATCH');
    const timestamp = Date.now();
    const newMovements: StockMovement[] = [];

    // 1. Deduct raw materials based on BOM recipe
    if (prod.hasRecipe && prod.recipe && prod.recipe.length > 0) {
      prod.recipe.forEach(recipeItem => {
        const totalUsed = recipeItem.quantity * params.quantityProduced;
        setIngredients(prev => prev.map(ing => {
          if (ing.id === recipeItem.ingredientId) {
            const nextStock = Math.max(0, ing.currentStock - totalUsed);
            newMovements.push({
              id: `mov-${Date.now()}-${Math.random()}`,
              timestamp,
              type: 'production_adjust',
              referenceId: batchNumber,
              itemId: ing.id,
              itemType: 'ingredient',
              itemName: ing.name,
              changeQty: -totalUsed,
              previousStock: ing.currentStock,
              newStock: nextStock,
              unit: ing.unit,
              notes: `Produksi Batch ${batchNumber} (${params.quantityProduced}x ${prod.name})`,
              staffName: currentUser.name,
            });
            return { ...ing, currentStock: nextStock, updatedAt: timestamp };
          }
          return ing;
        }));
      });
    }

    // 2. Add finished product stock
    setProducts(prev => prev.map(p => {
      if (p.id === prod.id) {
        const nextStock = p.currentStock + params.quantityProduced;
        newMovements.push({
          id: `mov-${Date.now()}-${Math.random()}`,
          timestamp,
          type: 'production_adjust',
          referenceId: batchNumber,
          itemId: p.id,
          itemType: 'product',
          itemName: p.name,
          changeQty: params.quantityProduced,
          previousStock: p.currentStock,
          newStock: nextStock,
          unit: 'pcs',
          notes: `Hasil Produksi Batch ${batchNumber}`,
          staffName: currentUser.name,
        });
        return { ...p, currentStock: nextStock };
      }
      return p;
    }));

    if (newMovements.length > 0) {
      setStockMovements(prev => [...newMovements, ...prev]);
    }

    // 3. Record Batch
    const batch: ProductionBatch = {
      id: `batch-${timestamp}`,
      batchNumber,
      timestamp,
      productId: prod.id,
      productName: prod.name,
      quantityProduced: params.quantityProduced,
      totalCogs: prod.cogs * params.quantityProduced,
      staffName: currentUser.name,
      notes: params.notes,
    };

    setProductionBatches(prev => [batch, ...prev]);
    return true;
  };

  // Auth / Permissions
  const hasPermission = (permission: Permission): boolean => {
    if (currentUser.role === 'admin') return true;
    return currentUser.permissions.includes(permission);
  };

  const switchUser = (pin: string): boolean => {
    const matched = users.find(u => u.pin === pin && u.active);
    if (matched) {
      setCurrentUser(matched);
      return true;
    }
    return false;
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const user: User = {
      ...newUser,
      id: `user-${Date.now()}`,
    };
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Categories CRUD
  const addCategory = (params: string | { name: string; type?: 'product' | 'ingredient' | 'general'; description?: string }) => {
    const name = typeof params === 'string' ? params.trim() : params.name.trim();
    const type = typeof params === 'string' ? 'product' : (params.type || 'product');
    const description = typeof params === 'string' ? undefined : (params.description?.trim() || undefined);
    
    if (!name) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      type,
      description
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, params: string | { name: string; type?: 'product' | 'ingredient' | 'general'; description?: string }) => {
    const name = typeof params === 'string' ? params.trim() : params.name.trim();
    const type = typeof params === 'string' ? undefined : params.type;
    const description = typeof params === 'string' ? undefined : (params.description?.trim() || undefined);

    if (!name) return;

    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          ...(type !== undefined ? { type } : {}),
          ...(description !== undefined ? { description } : {})
        };
      }
      return c;
    }));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Units CRUD
  const addUnit = (newUnit: Omit<UnitItem, 'id'>) => {
    const code = newUnit.code.trim().toLowerCase();
    const name = newUnit.name.trim();
    if (!code || !name) return;

    const item: UnitItem = {
      ...newUnit,
      id: `unit-${Date.now()}`,
      code,
      name,
      category: newUnit.category?.trim() || 'Jumlah / Satuan',
      description: newUnit.description?.trim() || undefined
    };
    setUnits(prev => [...prev, item]);
  };

  const updateUnit = (id: string, updated: Partial<UnitItem>) => {
    setUnits(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          ...updated,
          ...(updated.code ? { code: updated.code.trim().toLowerCase() } : {}),
          ...(updated.name ? { name: updated.name.trim() } : {}),
          ...(updated.category !== undefined ? { category: updated.category.trim() } : {}),
          ...(updated.description !== undefined ? { description: updated.description.trim() } : {})
        };
      }
      return u;
    }));
  };

  const deleteUnit = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  // Ingredients CRUD
  const addIngredient = (newIng: Omit<Ingredient, 'id' | 'updatedAt'>) => {
    const ing: Ingredient = {
      ...newIng,
      id: `ing-${Date.now()}`,
      updatedAt: Date.now(),
    };
    setIngredients(prev => [...prev, ing]);
    
    // Add initial stock movement
    if (ing.currentStock > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        timestamp: Date.now(),
        type: 'opname',
        itemId: ing.id,
        itemType: 'ingredient',
        itemName: ing.name,
        changeQty: ing.currentStock,
        previousStock: 0,
        newStock: ing.currentStock,
        unit: ing.unit,
        notes: 'Stok awal bahan baru',
        staffName: currentUser.name,
      };
      setStockMovements(prev => [movement, ...prev]);
    }
  };

  const updateIngredient = (updated: Ingredient) => {
    setIngredients(prev => prev.map(i => i.id === updated.id ? { ...updated, updatedAt: Date.now() } : i));
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  // Products CRUD
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const prod: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    setProducts(prev => [...prev, prod]);

    if (prod.trackStock && prod.currentStock > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        timestamp: Date.now(),
        type: 'opname',
        itemId: prod.id,
        itemType: 'product',
        itemName: prod.name,
        changeQty: prod.currentStock,
        previousStock: 0,
        newStock: prod.currentStock,
        unit: 'pcs',
        notes: 'Stok awal produk baru',
        staffName: currentUser.name,
      };
      setStockMovements(prev => [movement, ...prev]);
    }
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const applyHppToProduct = (productId: string, hppData: {
    recipe: RecipeItem[];
    directLaborCost: number;
    overheads: OverheadCost[];
    cogs: number;
    targetMarginPercent: number;
    suggestedPrice: number;
    price?: number;
  }) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          hasRecipe: hppData.recipe.length > 0,
          recipe: hppData.recipe,
          directLaborCost: hppData.directLaborCost,
          overheads: hppData.overheads,
          cogs: hppData.cogs,
          targetMarginPercent: hppData.targetMarginPercent,
          suggestedPrice: hppData.suggestedPrice,
          price: hppData.price !== undefined ? hppData.price : p.price,
        };
      }
      return p;
    }));
  };

  // Cart Calculations
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          productId: product.id,
          product,
          quantity,
          price: product.price,
          cogs: product.cogs,
          discountAmount: 0,
        }
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartItemQty = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: qty } : item));
  };

  const updateCartItemNote = (cartItemId: string, note: string) => {
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, note } : item));
  };

  const updateCartItemDiscount = (cartItemId: string, discount: number) => {
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, discountAmount: Math.max(0, discount) } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart Totals
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartDiscountTotal = cart.reduce((sum, item) => sum + (item.discountAmount * item.quantity), 0);
  const netSubtotal = Math.max(0, cartSubtotal - cartDiscountTotal);
  
  const cartTaxAmount = settings.enableTax 
    ? Math.round(netSubtotal * (settings.taxPercent / 100)) 
    : 0;
    
  const cartServiceAmount = settings.enableServiceCharge 
    ? Math.round(netSubtotal * (settings.serviceChargePercent / 100)) 
    : 0;

  const cartTotal = netSubtotal + cartTaxAmount + cartServiceAmount;

  // Checkout with AUTOMATIC REAL-TIME STOCK REDUCTION (Ingredients & Products)
  const checkout = (params: {
    paymentMethod: PaymentMethod;
    cashGiven?: number;
    orderType: 'dine_in' | 'take_away' | 'delivery';
    tableNumber?: string;
    customerName?: string;
    customerPhone?: string;
    discountTotal?: number;
    bankName?: string;
    referenceNumber?: string;
    dueDate?: string;
  }): Transaction => {
    const finalDiscount = (params.discountTotal ?? 0) + cartDiscountTotal;
    const finalNet = Math.max(0, cartSubtotal - finalDiscount);
    const finalTax = settings.enableTax ? Math.round(finalNet * (settings.taxPercent / 100)) : 0;
    const finalService = settings.enableServiceCharge ? Math.round(finalNet * (settings.serviceChargePercent / 100)) : 0;
    const grandTotal = finalNet + finalTax + finalService;

    const invoiceNumber = generateInvoiceNumber('INV');
    const timestamp = Date.now();

    // Calculate total COGS of the transaction
    const totalCogs = cart.reduce((sum, item) => sum + (item.cogs * item.quantity), 0);
    const grossProfit = finalNet - totalCogs;

    const change = params.paymentMethod === 'cash' && params.cashGiven 
      ? Math.max(0, params.cashGiven - grandTotal) 
      : 0;

    const transaction: Transaction = {
      id: `trx-${timestamp}`,
      invoiceNumber,
      timestamp,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      shiftId: currentShift ? currentShift.id : 'no-shift',
      orderType: params.orderType,
      tableNumber: params.tableNumber,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        sku: item.product.sku,
        price: item.price,
        cogs: item.cogs,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        note: item.note,
      })),
      subtotal: cartSubtotal,
      discountTotal: finalDiscount,
      taxPercent: settings.enableTax ? settings.taxPercent : 0,
      taxAmount: finalTax,
      serviceChargePercent: settings.enableServiceCharge ? settings.serviceChargePercent : 0,
      serviceChargeAmount: finalService,
      total: grandTotal,
      totalCogs,
      grossProfit,
      paymentMethod: params.paymentMethod,
      paymentDetails: {
        cashGiven: params.cashGiven,
        change,
        bankName: params.bankName,
        referenceNumber: params.referenceNumber,
        dueDate: params.dueDate,
      },
      status: 'completed',
    };

    // 1. Record Transaction
    setTransactions(prev => [transaction, ...prev]);

    // 2. Update Current Shift Totals
    if (currentShift) {
      setCurrentShift(prev => {
        if (!prev) return null;
        const isCash = params.paymentMethod === 'cash';
        return {
          ...prev,
          totalCashSales: isCash ? prev.totalCashSales + grandTotal : prev.totalCashSales,
          totalNonCashSales: !isCash ? prev.totalNonCashSales + grandTotal : prev.totalNonCashSales,
          expectedCash: isCash ? prev.expectedCash + grandTotal : prev.expectedCash,
        };
      });
    }

    // 3. AUTOMATIC STOCK DEDUCTIONS (BOM Ingredients & Finished Goods)
    const newMovements: StockMovement[] = [];

    // Deduct stock
    cart.forEach(cartItem => {
      const prod = cartItem.product;

      // A. If product has recipe ingredients, reduce ingredients stock!
      if (prod.hasRecipe && prod.recipe && prod.recipe.length > 0) {
        prod.recipe.forEach(recipeItem => {
          const totalQtyDeducted = recipeItem.quantity * cartItem.quantity;
          
          setIngredients(prevIngredients => prevIngredients.map(ing => {
            if (ing.id === recipeItem.ingredientId) {
              const prevStock = ing.currentStock;
              const nextStock = Math.max(0, prevStock - totalQtyDeducted);
              
              newMovements.push({
                id: `mov-${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                type: 'sale',
                referenceId: invoiceNumber,
                itemId: ing.id,
                itemType: 'ingredient',
                itemName: ing.name,
                changeQty: -totalQtyDeducted,
                previousStock: prevStock,
                newStock: nextStock,
                unit: ing.unit,
                notes: `Penjualan POS ${cartItem.quantity}x ${prod.name} (${invoiceNumber})`,
                staffName: currentUser.name,
              });

              return { ...ing, currentStock: nextStock, updatedAt: Date.now() };
            }
            return ing;
          }));
        });
      }

      // B. If product tracks its own stock
      if (prod.trackStock) {
        setProducts(prevProducts => prevProducts.map(p => {
          if (p.id === prod.id) {
            const prevStock = p.currentStock;
            const nextStock = Math.max(0, prevStock - cartItem.quantity);

            newMovements.push({
              id: `mov-${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
              type: 'sale',
              referenceId: invoiceNumber,
              itemId: p.id,
              itemType: 'product',
              itemName: p.name,
              changeQty: -cartItem.quantity,
              previousStock: prevStock,
              newStock: nextStock,
              unit: 'pcs',
              notes: `Penjualan POS #${invoiceNumber}`,
              staffName: currentUser.name,
            });

            return { ...p, currentStock: nextStock };
          }
          return p;
        }));
      }
    });

    if (newMovements.length > 0) {
      setStockMovements(prev => [...newMovements, ...prev]);
    }

    // Clear cart and show receipt modal
    clearCart();
    setReceiptModalTransaction(transaction);

    return transaction;
  };

  // Shift Management
  const startShift = (startingCash: number, notes?: string) => {
    const shift: CashierShift = {
      id: `shift-${Date.now()}`,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      startTime: Date.now(),
      startingCash,
      totalCashSales: 0,
      totalNonCashSales: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: startingCash,
      status: 'open',
      notes: notes || `Shift dibuka oleh ${currentUser.name}`,
    };
    setCurrentShift(shift);
  };

  const recordPettyCash = (type: 'in' | 'out', amount: number, notes: string) => {
    if (!currentShift) return;
    setCurrentShift(prev => {
      if (!prev) return null;
      const cashIn = type === 'in' ? prev.cashIn + amount : prev.cashIn;
      const cashOut = type === 'out' ? prev.cashOut + amount : prev.cashOut;
      const expectedCash = type === 'in' ? prev.expectedCash + amount : prev.expectedCash - amount;
      return {
        ...prev,
        cashIn,
        cashOut,
        expectedCash,
      };
    });

    if (type === 'out') {
      // Record as expense
      addExpense({
        date: new Date().toISOString().split('T')[0],
        category: 'Perlengkapan & Operasional',
        description: `Kas Keluar Kasir: ${notes}`,
        amount,
        recordedBy: currentUser.name,
      });
    }
  };

  const closeShift = (actualCash: number, notes?: string) => {
    if (!currentShift) return;
    const closed: CashierShift = {
      ...currentShift,
      endTime: Date.now(),
      actualCashCounted: actualCash,
      difference: actualCash - currentShift.expectedCash,
      status: 'closed',
      notes: notes ? `${currentShift.notes || ''} | ${notes}` : currentShift.notes,
    };
    setShiftsHistory(prev => [closed, ...prev]);
    setCurrentShift(null);
  };

  // Inventory: Opname & Restock
  const performStockOpname = (itemId: string, itemType: 'product' | 'ingredient', actualStock: number, notes: string) => {
    if (itemType === 'ingredient') {
      setIngredients(prev => prev.map(ing => {
        if (ing.id === itemId) {
          const diff = actualStock - ing.currentStock;
          const movement: StockMovement = {
            id: `mov-${Date.now()}`,
            timestamp: Date.now(),
            type: 'opname',
            itemId: ing.id,
            itemType: 'ingredient',
            itemName: ing.name,
            changeQty: diff,
            previousStock: ing.currentStock,
            newStock: actualStock,
            unit: ing.unit,
            notes: `Stok Opname: ${notes}`,
            staffName: currentUser.name,
          };
          setStockMovements(m => [movement, ...m]);
          return { ...ing, currentStock: actualStock, updatedAt: Date.now() };
        }
        return ing;
      }));
    } else {
      setProducts(prev => prev.map(prod => {
        if (prod.id === itemId) {
          const diff = actualStock - prod.currentStock;
          const movement: StockMovement = {
            id: `mov-${Date.now()}`,
            timestamp: Date.now(),
            type: 'opname',
            itemId: prod.id,
            itemType: 'product',
            itemName: prod.name,
            changeQty: diff,
            previousStock: prod.currentStock,
            newStock: actualStock,
            unit: 'pcs',
            notes: `Stok Opname: ${notes}`,
            staffName: currentUser.name,
          };
          setStockMovements(m => [movement, ...m]);
          return { ...prod, currentStock: actualStock };
        }
        return prod;
      }));
    }
  };

  const recordRestock = (params: {
    itemId: string;
    itemType: 'product' | 'ingredient';
    addedQty: number;
    costPerUnit?: number;
    supplierName?: string;
    totalAmount: number;
    notes?: string;
  }) => {
    const poNumber = generateInvoiceNumber('PO');
    
    if (params.itemType === 'ingredient') {
      setIngredients(prev => prev.map(ing => {
        if (ing.id === params.itemId) {
          const prevStock = ing.currentStock;
          const newStock = prevStock + params.addedQty;
          
          // Optionally update cost per unit if provided
          const updatedCost = params.costPerUnit || ing.costPerUnit;

          const movement: StockMovement = {
            id: `mov-${Date.now()}`,
            timestamp: Date.now(),
            type: 'restock',
            referenceId: poNumber,
            itemId: ing.id,
            itemType: 'ingredient',
            itemName: ing.name,
            changeQty: params.addedQty,
            previousStock: prevStock,
            newStock: newStock,
            unit: ing.unit,
            notes: `Restock PO ${poNumber} (${params.supplierName || ing.supplierName || 'Pemasok'}): ${params.notes || ''}`,
            staffName: currentUser.name,
          };
          setStockMovements(m => [movement, ...m]);

          return {
            ...ing,
            currentStock: newStock,
            costPerUnit: updatedCost,
            supplierName: params.supplierName || ing.supplierName,
            updatedAt: Date.now(),
          };
        }
        return ing;
      }));
    } else {
      setProducts(prev => prev.map(prod => {
        if (prod.id === params.itemId) {
          const prevStock = prod.currentStock;
          const newStock = prevStock + params.addedQty;

          const movement: StockMovement = {
            id: `mov-${Date.now()}`,
            timestamp: Date.now(),
            type: 'restock',
            referenceId: poNumber,
            itemId: prod.id,
            itemType: 'product',
            itemName: prod.name,
            changeQty: params.addedQty,
            previousStock: prevStock,
            newStock: newStock,
            unit: 'pcs',
            notes: `Restock PO ${poNumber}: ${params.notes || ''}`,
            staffName: currentUser.name,
          };
          setStockMovements(m => [movement, ...m]);

          return { ...prod, currentStock: newStock };
        }
        return prod;
      }));
    }

    // Also optionally record expense for restock
    if (params.totalAmount > 0) {
      addExpense({
        date: new Date().toISOString().split('T')[0],
        category: 'Perlengkapan & Operasional',
        description: `Pembelian Stok Bahan (${poNumber}) - ${params.supplierName || 'Supplier'}`,
        amount: params.totalAmount,
        recordedBy: currentUser.name,
      });
    }
  };

  // Expenses CRUD
  const addExpense = (exp: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = {
      ...exp,
      id: `exp-${Date.now()}`,
      createdAt: Date.now(),
    };
    setExpenses(prev => [expense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const exportDataJson = (): string => {
    const backup = {
      version: '4.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      users,
      categories,
      units,
      ingredients,
      products,
      transactions,
      currentShift,
      shiftsHistory,
      stockMovements,
      expenses,
      customers,
      suppliers,
      promos,
      productionBatches,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && data.ingredients) {
        if (data.settings) setSettings(data.settings);
        if (data.users) setUsers(data.users);
        if (data.categories) setCategories(data.categories);
        if (data.units) setUnits(data.units);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.products) setProducts(data.products);
        if (data.transactions) setTransactions(data.transactions);
        if (data.shiftsHistory) setShiftsHistory(data.shiftsHistory);
        if (data.stockMovements) setStockMovements(data.stockMovements);
        if (data.expenses) setExpenses(data.expenses);
        if (data.customers) setCustomers(data.customers);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.promos) setPromos(data.promos);
        if (data.productionBatches) setProductionBatches(data.productionBatches);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const resetAllData = () => {
    localStorage.clear();
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCategories(INITIAL_CATEGORIES);
    setUnits(INITIAL_UNITS);
    setIngredients(INITIAL_INGREDIENTS);
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCurrentShift(INITIAL_SHIFT);
    setShiftsHistory([]);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setExpenses(INITIAL_EXPENSES);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPromos(INITIAL_PROMOS);
    setProductionBatches(INITIAL_PRODUCTION_BATCHES);
    setCart([]);
  };

  // Low stock counter
  const lowIngredientsCount = ingredients.filter(i => i.currentStock <= i.minStock).length;
  const lowProductsCount = products.filter(p => p.trackStock && p.currentStock <= p.minStock).length;
  const lowStockItemsCount = lowIngredientsCount + lowProductsCount;

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      currentUser,
      users,
      hasPermission,
      switchUser,
      addUser,
      updateUser,
      deleteUser,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      units,
      addUnit,
      updateUnit,
      deleteUnit,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      suppliers,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      promos,
      addPromo,
      updatePromo,
      deletePromo,
      productionBatches,
      recordProductionBatch,
      ingredients,
      addIngredient,
      updateIngredient,
      deleteIngredient,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      applyHppToProduct,
      cart,
      addToCart,
      removeFromCart,
      updateCartItemQty,
      updateCartItemNote,
      updateCartItemDiscount,
      clearCart,
      cartSubtotal,
      cartTaxAmount,
      cartServiceAmount,
      cartDiscountTotal,
      cartTotal,
      transactions,
      checkout,
      receiptModalTransaction,
      setReceiptModalTransaction,
      currentShift,
      shiftsHistory,
      startShift,
      recordPettyCash,
      closeShift,
      stockMovements,
      performStockOpname,
      recordRestock,
      expenses,
      addExpense,
      deleteExpense,
      settings,
      updateSettings,
      exportDataJson,
      importDataJson,
      resetAllData,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      isBarcodeScannerOpen,
      setIsBarcodeScannerOpen,
      isShiftModalOpen,
      setIsShiftModalOpen,
      isSwitchUserModalOpen,
      setIsSwitchUserModalOpen,
      isSidebarOpenMobile,
      setIsSidebarOpenMobile,
      isSidebarCollapsedDesktop,
      setIsSidebarCollapsedDesktop,
      lowStockItemsCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
