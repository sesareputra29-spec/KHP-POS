import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  ScanBarcode, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Truck, 
  Percent, 
  MessageSquare, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { CheckoutModal } from './CheckoutModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ReceiptModal } from './ReceiptModal';

export const PosView: React.FC = () => {
  const { 
    products, 
    categories, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartItemQty, 
    updateCartItemNote, 
    updateCartItemDiscount, 
    clearCart,
    cartSubtotal,
    cartDiscountTotal,
    cartTaxAmount,
    cartServiceAmount,
    cartTotal,
    settings,
    setIsBarcodeScannerOpen,
    ingredients
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<'dine_in' | 'take_away' | 'delivery'>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('Meja 01');
  const [customerName, setCustomerName] = useState<string>('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [editingDiscount, setEditingDiscount] = useState<number>(0);

  // Hardware USB Barcode Scanner Global Key Listener
  const barcodeBuffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      const char = e.key;

      if (currentTime - lastKeyTime.current > 100) {
        barcodeBuffer.current = '';
      }
      lastKeyTime.current = currentTime;

      if (char === 'Enter') {
        if (barcodeBuffer.current.length >= 3) {
          const scanned = barcodeBuffer.current;
          const match = products.find(
            p => p.active && (p.barcode.toLowerCase() === scanned.toLowerCase() || p.sku.toLowerCase() === scanned.toLowerCase())
          );
          if (match) {
            addToCart(match, 1);
          }
          barcodeBuffer.current = '';
        }
      } else if (char.length === 1) {
        barcodeBuffer.current += char;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, addToCart]);

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    if (!p.active) return false;
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) || 
      p.barcode.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // Calculate approximate stock based on ingredients
  const getProductStockStatus = (p: Product) => {
    if (p.trackStock) {
      return { stock: p.currentStock, isLow: p.currentStock <= p.minStock };
    }
    if (p.hasRecipe && p.recipe && p.recipe.length > 0) {
      let maxPortions = 9999;
      p.recipe.forEach(r => {
        const ing = ingredients.find(i => i.id === r.ingredientId);
        if (ing && r.quantity > 0) {
          const available = Math.floor(ing.currentStock / r.quantity);
          if (available < maxPortions) maxPortions = available;
        }
      });
      return { stock: maxPortions === 9999 ? 0 : maxPortions, isLow: maxPortions <= 5 };
    }
    return { stock: 99, isLow: false };
  };

  const handleOpenEdit = (cartItemId: string, currentNote?: string, currentDiscount?: number) => {
    setEditingItemId(cartItemId);
    setEditingNote(currentNote || '');
    setEditingDiscount(currentDiscount || 0);
  };

  const handleSaveEdit = (cartItemId: string) => {
    updateCartItemNote(cartItemId, editingNote);
    updateCartItemDiscount(cartItemId, editingDiscount);
    setEditingItemId(null);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50/80">
      {/* LEFT: PRODUCTS CATALOG & SEARCH */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white border-r border-slate-200/90">
        {/* Top Controls Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-200/90 space-y-3">
          {/* Order Type & Barcode Trigger */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Order Type Selector */}
            <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setOrderType('dine_in')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  orderType === 'dine_in' 
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Dine In</span>
              </button>
              <button
                onClick={() => setOrderType('take_away')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  orderType === 'take_away' 
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Take Away</span>
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  orderType === 'delivery' 
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Delivery</span>
              </button>
            </div>

            {/* Barcode Scanner Button */}
            <button
              onClick={() => setIsBarcodeScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
              title="Buka Kamera Barcode Scanner"
            >
              <ScanBarcode className="w-4 h-4" />
              <span>Scan Barcode</span>
            </button>
          </div>

          {/* Search Bar & Table Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama menu, SKU, atau barcode..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {orderType === 'dine_in' && (
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="No. Meja"
                className="w-24 sm:w-28 px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-center font-bold text-slate-800"
              />
            )}
          </div>

          {/* Category Horizontal Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Menu ({products.filter(p => p.active).length})
            </button>
            {categories.map(c => {
              const count = products.filter(p => p.active && p.categoryId === c.id).length;
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/60">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-4">
              <ShoppingBag className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada produk ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau pilih kategori lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const stockInfo = getProductStockStatus(product);
                const isOutOfStock = stockInfo.stock <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product, 1)}
                    disabled={isOutOfStock}
                    className={`p-3.5 bg-white rounded-2xl border border-slate-200 text-left transition-all hover:border-emerald-500 hover:shadow-sm flex flex-col justify-between relative group ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      {/* Category & Stock Indicators */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                        <span className="truncate pr-1 font-medium">{product.categoryName}</span>
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isOutOfStock
                            ? 'bg-red-50 text-red-700'
                            : stockInfo.isLow 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          Stok: {stockInfo.stock}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
                        {product.name}
                      </h4>

                      {/* SKU / Barcode */}
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        {product.sku}
                      </p>
                    </div>

                    {/* Price and Add Affordance */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-extrabold text-xs sm:text-sm text-emerald-700 font-mono tabular-nums">
                        {formatRupiah(product.price)}
                      </span>
                      <span className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 flex items-center justify-center transition-colors shadow-2xs">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: CART & BILLING PANEL */}
      <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-auto lg:h-full shrink-0 shadow-xs">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm">Pesanan Kasir</h3>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} item
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {orderType === 'dine_in' ? `Dine In · ${tableNumber}` : orderType === 'take_away' ? 'Take Away' : 'Delivery'}
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-xl transition-colors flex items-center gap-1 font-semibold"
              title="Kosongkan Keranjang"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 max-h-[320px] lg:max-h-none bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center text-slate-400 p-4">
              <ShoppingBag className="w-8 h-8 mb-2 opacity-30 text-emerald-600" />
              <p className="text-xs font-semibold text-slate-700">Keranjang masih kosong</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Klik menu pada katalog untuk menambahkan pesanan.</p>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.id}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.product.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                      <span className="font-semibold text-slate-700">{formatRupiah(item.price)}</span>
                      {item.discountAmount > 0 && (
                        <span className="text-emerald-600 font-medium">
                          (Diskon: -{formatRupiah(item.discountAmount)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                    <button
                      onClick={() => updateCartItemQty(item.id, item.quantity - 1)}
                      className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-mono text-xs font-bold tabular-nums text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQty(item.id, item.quantity + 1)}
                      className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Note & Item Discount Display or Inline Editor */}
                {editingItemId === item.id ? (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5">
                    <input
                      type="text"
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      placeholder="Catatan pesanan (contoh: Kurang manis)..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1.5 text-[11px] text-slate-400">Rp</span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={editingDiscount || ''}
                          onChange={(e) => setEditingDiscount(Number(e.target.value) || 0)}
                          placeholder="Diskon item"
                          className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => handleOpenEdit(item.id, item.note, item.discountAmount)}
                      className="text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors text-left"
                    >
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[170px]">
                        {item.note || 'Tambah Catatan / Diskon'}
                      </span>
                    </button>

                    <div className="font-extrabold text-xs text-slate-900 font-mono tabular-nums">
                      {formatRupiah((item.price - item.discountAmount) * item.quantity)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Cart Billing Summary & Checkout Trigger */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold tabular-nums text-slate-800">{formatRupiah(cartSubtotal)}</span>
          </div>

          {cartDiscountTotal > 0 && (
            <div className="flex justify-between text-xs text-emerald-700 font-medium">
              <span>Diskon Menu:</span>
              <span className="font-mono tabular-nums font-bold">-{formatRupiah(cartDiscountTotal)}</span>
            </div>
          )}

          {settings.enableTax && (
            <div className="flex justify-between text-xs text-slate-600">
              <span>PPN ({settings.taxPercent}%):</span>
              <span className="font-mono tabular-nums">+{formatRupiah(cartTaxAmount)}</span>
            </div>
          )}

          {settings.enableServiceCharge && (
            <div className="flex justify-between text-xs text-slate-600">
              <span>Layanan ({settings.serviceChargePercent}%):</span>
              <span className="font-mono tabular-nums">+{formatRupiah(cartServiceAmount)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-700">Total Tagihan:</span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono tabular-nums">
              {formatRupiah(cartTotal)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            disabled={cart.length === 0}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Sekarang ({formatRupiah(cartTotal)})</span>
          </button>
        </div>
      </div>

      {/* MODALS */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        orderType={orderType}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        customerName={customerName}
        setCustomerName={setCustomerName}
      />
      <BarcodeScannerModal />
      <ReceiptModal />
    </div>
  );
};
