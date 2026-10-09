import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, getSubcategories, getCategoryName, getSubcategoryName, BRANDS } from '../../data/categories';
import { getSubcategoryImage } from '../../data/productImages';
import { CategoryIcon } from '../CategoryIcon';
import { Modal } from '../Modal';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, AlertTriangle,
  CreditCard, Banknote, Smartphone, FileText, Receipt,
  ChevronRight, Check, Layers, ScanLine, Camera, X, Printer, Award,
} from 'lucide-react';
import type { PaymentMethod, Sale, Product } from '../../types';

export function CounterTab() {
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount, setSales, setProducts, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcatFilter, setSubcatFilter] = useState<string>('all');
  const [subcatOpen, setSubcatOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [brandOpen, setBrandOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [voucherOpen, setVoucherOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (subcatFilter !== 'all' && p.subcategory !== subcatFilter) return false;
      if (brandFilter !== 'all' && p.brand !== brandFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.barcode.includes(search) && !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, search, categoryFilter, subcatFilter, brandFilter]);

  const handleSelectCategory = (catId: string) => {
    if (categoryFilter === catId) {
      setCategoryFilter('all');
      setSubcatFilter('all');
      setBrandFilter('all');
    } else {
      setCategoryFilter(catId);
      setSubcatFilter('all');
      setBrandFilter('all');
    }
    setSubcatOpen(false);
    setBrandOpen(false);
  };

  const availableBrands = useMemo(() => {
    const filtered = products.filter((p) => {
      if (!p.active) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (subcatFilter !== 'all' && p.subcategory !== subcatFilter) return false;
      return true;
    });
    const brandSet = new Set(filtered.map((p) => p.brand));
    return BRANDS.filter((b) => brandSet.has(b));
  }, [products, categoryFilter, subcatFilter]);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast('Sin stock disponible', 'error');
      return;
    }
    addToCart(product);
  };

  const handleScan = () => {
    setScanModalOpen(true);
    setScanning(true);
    setManualBarcode('');
    setTimeout(() => {
      const found = products.find((p) => p.active && p.hasBarcode);
      if (found) {
        const randomProduct = products.filter((p) => p.active && p.hasBarcode)[Math.floor(Math.random() * products.filter((p) => p.active && p.hasBarcode).length)];
        setManualBarcode(randomProduct.barcode);
        setScanning(false);
        handleBarcodeLookup(randomProduct.barcode);
      }
    }, 1800);
  };

  const handleBarcodeLookup = (code: string) => {
    const product = products.find((p) => p.barcode === code && p.active);
    if (!product) {
      showToast('No se encontró ningún producto con el código ' + code, 'error');
      return;
    }
    if (product.stock <= 0) {
      showToast('Producto sin stock: ' + product.name, 'error');
      return;
    }
    addToCart(product);
    showToast('Producto agregado: ' + product.name, 'success');
    setScanModalOpen(false);
    setManualBarcode('');
  };

  const handleManualBarcodeSubmit = () => {
    if (!manualBarcode.trim()) {
      showToast('Ingresa un código de barras', 'error');
      return;
    }
    handleBarcodeLookup(manualBarcode.trim());
  };

  const handleCheckout = () => {
    if (!paymentMethod) {
      showToast('Selecciona un método de pago', 'error');
      return;
    }
    const sale: Sale = {
      id: 's' + Date.now(),
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      total: cartTotal,
      paymentMethod: paymentMethod as PaymentMethod,
      createdAt: new Date().toISOString(),
      cashier: 'Juan Mendoza',
      customerName: customerName.trim() || 'Cliente mostrador',
    };
    setSales((prev) => [...prev, sale]);
    setProducts((prev) => prev.map((p) => {
      const cartItem = cart.find((c) => c.product.id === p.id);
      if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      return p;
    }));
    clearCart();
    setCheckoutOpen(false);
    setPaymentMethod('');
    setCustomerName('');
    setLastSale(sale);
    setVoucherOpen(true);
    showToast('Venta finalizada. S/ ' + sale.total.toFixed(2) + ' — ' + (paymentMethod === 'efectivo' ? 'Efectivo' : paymentMethod === 'yape_plin' ? 'Yape/Plin' : 'Tarjeta'), 'success');
  };

  const paymentMethods = [
    { id: 'efectivo' as const, label: 'Efectivo', icon: Banknote },
    { id: 'yape_plin' as const, label: 'Yape / Plin', icon: Smartphone },
    { id: 'tarjeta' as const, label: 'Tarjeta', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2 sticky top-0 bg-secondary-50 z-10">
        <h2 className="text-xl font-bold text-secondary-900 mb-3">Mostrador / Caja</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-secondary-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              placeholder="Buscar por nombre o código..."
            />
          </div>
          <button
            onClick={handleScan}
            className="flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all flex-shrink-0"
          >
            <ScanLine className="w-5 h-5" />
            <span className="hidden sm:inline">Escanear</span>
          </button>
        </div>
        {/* Category chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => { setCategoryFilter('all'); setSubcatFilter('all'); setSubcatOpen(false); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              categoryFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 border border-secondary-200'
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat.id ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 border border-secondary-200'
              }`}
            >
              <CategoryIcon id={cat.id} className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subcategory selector */}
        {categoryFilter !== 'all' && (
          <div className="mt-2 animate-fade-in">
            <button
              onClick={() => setSubcatOpen(!subcatOpen)}
              className="w-full px-3 py-2 rounded-lg border border-secondary-200 bg-white outline-none text-xs text-left flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-secondary-400" />
                <span className={subcatFilter !== 'all' ? 'text-secondary-900 font-medium' : 'text-secondary-400'}>
                  {subcatFilter !== 'all' ? getSubcategoryName(categoryFilter, subcatFilter) : 'Filtrar por subcategoría...'}
                </span>
              </span>
              <ChevronRight className={`w-3.5 h-3.5 text-secondary-400 transition-transform ${subcatOpen ? 'rotate-90' : ''}`} />
            </button>
            {subcatOpen && (
              <div className="mt-1.5 space-y-0.5 animate-fade-in max-h-48 overflow-y-auto scrollbar-thin bg-white rounded-lg border border-secondary-100 p-1">
                <button
                  onClick={() => { setSubcatFilter('all'); setSubcatOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-left transition-all ${
                    subcatFilter === 'all' ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-secondary-50 text-secondary-700'
                  }`}
                >
                  Todas las subcategorías
                  {subcatFilter === 'all' && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>
                {getSubcategories(categoryFilter).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => { setSubcatFilter(sub.id); setSubcatOpen(false); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-left transition-all ${
                      subcatFilter === sub.id ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-secondary-50 text-secondary-700'
                    }`}
                  >
                    {sub.name}
                    {subcatFilter === sub.id && <Check className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Brand filter */}
        {categoryFilter !== 'all' && availableBrands.length > 0 && (
          <div className="mt-2 animate-fade-in">
            <button
              onClick={() => setBrandOpen(!brandOpen)}
              className="w-full px-3 py-2 rounded-lg border border-secondary-200 bg-white outline-none text-xs text-left flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-secondary-400" />
                <span className={brandFilter !== 'all' ? 'text-secondary-900 font-medium' : 'text-secondary-400'}>
                  {brandFilter !== 'all' ? brandFilter : 'Filtrar por marca...'}
                </span>
              </span>
              <ChevronRight className={`w-3.5 h-3.5 text-secondary-400 transition-transform ${brandOpen ? 'rotate-90' : ''}`} />
            </button>
            {brandOpen && (
              <div className="mt-1.5 space-y-0.5 animate-fade-in max-h-48 overflow-y-auto scrollbar-thin bg-white rounded-lg border border-secondary-100 p-1">
                <button
                  onClick={() => { setBrandFilter('all'); setBrandOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-left transition-all ${
                    brandFilter === 'all' ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-secondary-50 text-secondary-700'
                  }`}
                >
                  Todas las marcas
                  {brandFilter === 'all' && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>
                {availableBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => { setBrandFilter(b); setBrandOpen(false); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-left transition-all ${
                      brandFilter === b ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-secondary-50 text-secondary-700'
                    }`}
                  >
                    {b}
                    {brandFilter === b && <Check className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product list */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 scrollbar-thin">
        <div className="space-y-2">
          {filteredProducts.map((product) => {
            const inCart = cart.find((c) => c.product.id === product.id);
            const lowStock = product.stock <= product.minStock;
            return (
              <div key={product.id} className={`flex items-center gap-3 bg-white rounded-xl p-3 card-shadow ${inCart ? 'ring-2 ring-primary-300' : ''}`}>
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-secondary-100">
                  <img
                    src={getSubcategoryImage(product.subcategory)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-secondary-400">{getCategoryName(product.category)}</span>
                    <span className="text-xs text-secondary-300">›</span>
                    <span className="text-xs text-secondary-400">{getSubcategoryName(product.category, product.subcategory)}</span>
                    <span className="text-xs text-secondary-300">›</span>
                    <span className="text-xs text-secondary-400">{product.brand}</span>
                    {lowStock && (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-warning-600 bg-warning-50 px-1.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-2.5 h-2.5" /> Stock bajo
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="text-[10px] font-medium text-danger-600 bg-danger-50 px-1.5 py-0.5 rounded-full">Agotado</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-secondary-900">S/ {product.price.toFixed(2)}</p>
                  <p className="text-xs text-secondary-400">Stock: {product.stock}</p>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-8 h-8 rounded-lg bg-primary-600 hover:bg-primary-700 active:scale-90 disabled:opacity-30 disabled:active:scale-100 text-white flex items-center justify-center transition-all flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-secondary-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart summary bar */}
      {cart.length > 0 && (
        <div className="border-t border-secondary-200 bg-white px-4 py-3 space-y-2 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-secondary-700">{cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}</span>
            </div>
            <span className="text-lg font-bold text-secondary-900">S/ {cartTotal.toFixed(2)}</span>
          </div>

          {/* Cart items quick view */}
          <div className="max-h-32 overflow-y-auto scrollbar-thin space-y-1.5">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-secondary-700 text-xs">{item.product.name}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-medium text-secondary-900">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center transition-colors" disabled={item.quantity >= item.product.stock}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="w-16 text-right font-medium text-secondary-600 text-xs">S/ {(item.product.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.product.id)} className="text-secondary-400 hover:text-danger-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => showToast('Cotización generada y enviada a Cotizaciones y Faltantes', 'info')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-secondary-100 hover:bg-secondary-200 active:scale-95 text-secondary-700 rounded-xl py-2.5 text-sm font-medium transition-all"
            >
              <FileText className="w-4 h-4" /> Cotizar
            </button>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="flex-[2] flex items-center justify-center gap-1.5 bg-success-600 hover:bg-success-700 active:scale-95 text-white rounded-xl py-2.5 text-sm font-semibold transition-all"
            >
              <Receipt className="w-4 h-4" /> Cobrar / Finalizar
            </button>
          </div>
        </div>
      )}

      {/* Scanner modal */}
      <Modal open={scanModalOpen} onClose={() => { setScanModalOpen(false); setScanning(false); }} title="Escanear Producto">
        <div className="space-y-4">
          <div className="relative bg-secondary-900 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
            {scanning ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-x-8 inset-y-8 border-2 border-primary-400 rounded-xl overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-primary-400 animate-pulse-soft" style={{ top: '50%', boxShadow: '0 0 20px #3b82f6' }} />
                </div>
                <Camera className="w-12 h-12 text-white/30 absolute" />
              </div>
            ) : (
              <div className="text-center text-white/40">
                <Camera className="w-16 h-16 mx-auto mb-2" />
                <p className="text-sm">Cámara lista</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-secondary-400">o ingresa el código manualmente</p>
          </div>

          <div className="flex gap-2">
            <input
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleManualBarcodeSubmit(); }}
              className="flex-1 px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              placeholder="Código de barras..."
            />
            <button
              onClick={handleManualBarcodeSubmit}
              className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>

          {scanning && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary-600">
              <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
              Escaneando...
            </div>
          )}
        </div>
      </Modal>

      {/* Checkout modal */}
      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Finalizar Venta">
        <div className="space-y-4">
          <div className="bg-secondary-50 rounded-xl p-4">
            <div className="flex justify-between text-sm text-secondary-600 mb-1">
              <span>Subtotal</span><span>S/ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-secondary-600 mb-2">
              <span>Artículos</span><span>{cartCount}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-secondary-900 pt-2 border-t border-secondary-200">
              <span>Total</span><span>S/ {cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-secondary-700 mb-1.5 block">Nombre del comprador</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              placeholder="Nombre del cliente (opcional)"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-secondary-700 mb-2">Método de pago</p>
            <div className="space-y-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    paymentMethod === pm.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-secondary-300 text-secondary-700'
                  }`}
                >
                  <pm.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{pm.label}</span>
                  {paymentMethod === pm.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-success-600 hover:bg-success-700 active:scale-95 text-white rounded-xl py-3 font-semibold transition-all"
          >
            Confirmar Pago
          </button>
        </div>
      </Modal>

      {/* Voucher modal */}
      {voucherOpen && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4" onClick={() => setVoucherOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto scrollbar-thin animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {/* Voucher header */}
            <div className="text-center px-6 pt-6 pb-4 border-b border-dashed border-secondary-200">
              <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-secondary-900">PAPELERAPP</h3>
              <p className="text-xs text-secondary-400 mt-1">Ruc: 10457896321-001</p>
              <p className="text-xs text-secondary-400">Av. Los Próceres 123, Lima</p>
              <p className="text-xs text-secondary-400">Tel: 987-654-321</p>
            </div>

            {/* Sale info */}
            <div className="px-6 py-3 border-b border-dashed border-secondary-200 space-y-1">
              <div className="flex justify-between text-xs text-secondary-500">
                <span>N° Voucher:</span>
                <span className="font-mono font-medium text-secondary-700">{lastSale.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary-500">
                <span>Fecha:</span>
                <span className="text-secondary-700">{new Date(lastSale.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary-500">
                <span>Cajero:</span>
                <span className="text-secondary-700">{lastSale.cashier}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary-500">
                <span>Cliente:</span>
                <span className="text-secondary-700">{lastSale.customerName}</span>
              </div>
            </div>

            {/* Items */}
            <div className="px-6 py-3 border-b border-dashed border-secondary-200">
              <div className="flex justify-between text-[10px] font-medium text-secondary-400 uppercase mb-2">
                <span>Producto</span>
                <span>Importe</span>
              </div>
              <div className="space-y-2">
                {lastSale.items.map((item, idx) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div key={idx} className="text-xs">
                      <p className="font-medium text-secondary-800">{item.name}</p>
                      <div className="flex justify-between text-secondary-500">
                        <span>
                          {product ? product.brand : 'Sin marca'} · {item.quantity} x S/ {item.price.toFixed(2)}
                        </span>
                        <span className="font-medium text-secondary-700">S/ {(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="px-6 py-3 border-b border-dashed border-secondary-200 space-y-1.5">
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Subtotal</span>
                <span>S/ {lastSale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Op. Gratuita</span>
                <span>S/ 0.00</span>
              </div>
              <div className="flex justify-between text-base font-bold text-secondary-900 pt-1.5 border-t border-secondary-200">
                <span>TOTAL</span>
                <span>S/ {lastSale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="px-6 py-3 border-b border-dashed border-secondary-200">
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Pago con:</span>
                <span className="font-medium text-secondary-700">
                  {lastSale.paymentMethod === 'efectivo' ? 'Efectivo' : lastSale.paymentMethod === 'yape_plin' ? 'Yape / Plin' : 'Tarjeta'}
                </span>
              </div>
              <div className="flex justify-between text-sm text-secondary-600 mt-1">
                <span>Vuelto</span>
                <span>S/ 0.00</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 text-center">
              <p className="text-xs text-secondary-400 mb-1">¡Gracias por su compra!</p>
              <p className="text-[10px] text-secondary-300">Conserve este voucher para cualquier cambio</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setVoucherOpen(false); showToast('Voucher enviado a impresora térmica', 'info'); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl py-2.5 text-sm font-medium transition-all"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button
                  onClick={() => setVoucherOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-secondary-100 hover:bg-secondary-200 active:scale-95 text-secondary-700 rounded-xl py-2.5 text-sm font-medium transition-all"
                >
                  <X className="w-4 h-4" /> Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
