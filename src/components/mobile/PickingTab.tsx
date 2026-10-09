import { useState, useMemo, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../Modal';
import {
  Camera, ScanLine, Loader2, Sparkles, Check, RefreshCw,
  Tag, Scale, Star, Printer, Zap, Package,
  TrendingUp, AlertCircle, Search, School, ArrowRight,
  ArrowLeft, Plus, Barcode, ShieldCheck, Lock,
  ChevronRight, CheckCircle2, ShoppingBag, Trash2,
  Banknote, Smartphone, X,
} from 'lucide-react';
import type { Product, PaymentMethod } from '../../types';

type Tier = 'economica' | 'estandar' | 'premium';
type Step = 'capture' | 'processing' | 'options' | 'detail' | 'enpaque' | 'checkout';
type SwapContext = 'detail' | 'pack' | null;

interface DetectedItem {
  name: string;
  quantity: number;
  subcategory: string;
  economica: Product;
  standard: Product;
  premium: Product;
}

interface PackItem {
  product: Product;
  quantity: number;
  packed: boolean;
  scanned: boolean;
}

const TIER_META: Record<Tier, { label: string; icon: typeof Tag; color: string; bg: string; border: string; ring: string; description: string }> = {
  economica: {
    label: 'Económica',
    icon: Tag,
    color: 'text-success-600',
    bg: 'bg-success-50',
    border: 'border-success-400',
    ring: 'ring-success-200',
    description: 'Marcas genéricas, menor costo',
  },
  estandar: {
    label: 'Estándar',
    icon: Scale,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-400',
    ring: 'ring-primary-200',
    description: 'Calidad-precio, lo más vendido',
  },
  premium: {
    label: 'Premium',
    icon: Star,
    color: 'text-accent-600',
    bg: 'bg-accent-50',
    border: 'border-accent-400',
    ring: 'ring-accent-200',
    description: 'Marcas top: Faber-Castell, Stanford',
  },
};

const PRODUCT_IMAGES: Record<string, string> = {
  cuadernos: 'https://images.pexels.com/photos/8119804/pexels-photo-8119804.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
  escritura: 'https://images.pexels.com/photos/18889468/pexels-photo-18889468.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
  manualidades: 'https://images.pexels.com/photos/14759603/pexels-photo-14759603.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
  arte_diseno: 'https://images.pexels.com/photos/627901/pexels-photo-627901.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
  maleteria: 'https://images.pexels.com/photos/29765813/pexels-photo-29765813.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
  default: 'https://images.pexels.com/photos/28921196/pexels-photo-28921196.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
};

function getProductImage(subcategory: string): string {
  const key = subcategory.replace(/-/g, '_');
  return PRODUCT_IMAGES[key] ?? PRODUCT_IMAGES.default;
}

function tierToKey(tier: Tier): 'economica' | 'standard' | 'premium' {
  return tier === 'economica' ? 'economica' : tier === 'estandar' ? 'standard' : 'premium';
}

export function PickingTab() {
  const { products, showToast, setSchoolLists, schoolLists, setProducts, setSales, authUser } = useApp();
  const [step, setStep] = useState<Step>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [grade, setGrade] = useState('');
  const [packItems, setPackItems] = useState<PackItem[]>([]);
  const [currentPackIndex, setCurrentPackIndex] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [extraProductModal, setExtraProductModal] = useState(false);
  const [extraSearch, setExtraSearch] = useState('');
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapTargetIndex, setSwapTargetIndex] = useState<number | null>(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [swapContext, setSwapContext] = useState<SwapContext>(null);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [showQrModal, setShowQrModal] = useState<'yape' | 'plin' | null>(null);
  const [editableItems, setEditableItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [imageViewer, setImageViewer] = useState<{ src: string; name: string; price: number } | null>(null);

  const detectedItems: DetectedItem[] = useMemo(() => {
    return [
      {
        name: 'Cuaderno Cuadriculado 100h',
        quantity: 3,
        subcategory: 'cuadernos',
        economica: products.find((p) => p.id === 'p003')!,
        standard: products.find((p) => p.id === 'p001')!,
        premium: products.find((p) => p.id === 'p002')!,
      },
      {
        name: 'Lápiz HB #2',
        quantity: 6,
        subcategory: 'escritura',
        economica: products.find((p) => p.id === 'p004')!,
        standard: products.find((p) => p.id === 'p004')!,
        premium: products.find((p) => p.id === 'p034')!,
      },
      {
        name: 'Borrador',
        quantity: 2,
        subcategory: 'escritura',
        economica: products.find((p) => p.id === 'p006')!,
        standard: products.find((p) => p.id === 'p006')!,
        premium: products.find((p) => p.id === 'p006')!,
      },
      {
        name: 'Regla 30cm',
        quantity: 1,
        subcategory: 'escritura',
        economica: products.find((p) => p.id === 'p011')!,
        standard: products.find((p) => p.id === 'p009')!,
        premium: products.find((p) => p.id === 'p009')!,
      },
      {
        name: 'Témpera 6 colores',
        quantity: 1,
        subcategory: 'manualidades',
        economica: products.find((p) => p.id === 'p013')!,
        standard: products.find((p) => p.id === 'p012')!,
        premium: products.find((p) => p.id === 'p033')!,
      },
      {
        name: 'Cartuchera',
        quantity: 1,
        subcategory: 'maleteria',
        economica: products.find((p) => p.id === 'p021')!,
        standard: products.find((p) => p.id === 'p021')!,
        premium: products.find((p) => p.id === 'p021')!,
      },
    ].filter((item) => item.economica && item.standard && item.premium);
  }, [products]);

  const quoteOptions = useMemo(() => {
    const tiers: Tier[] = ['economica', 'estandar', 'premium'];
    return tiers.map((tier) => {
      const key = tierToKey(tier);
      const items = detectedItems.map((det) => ({ product: det[key], quantity: det.quantity }));
      const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      return { tier, ...TIER_META[tier], items, total };
    });
  }, [detectedItems]);

  const selectedOption = selectedTier ? quoteOptions.find((o) => o.tier === selectedTier)! : null;
  const totalEconomica = quoteOptions[0]?.total ?? 0;
  const totalPremium = quoteOptions[2]?.total ?? 0;

  const detailTotal = editableItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  // ===== Handlers =====

  const handleCapture = () => {
    setStep('processing');
    setTimeout(() => {
      setCapturedImage('https://images.pexels.com/photos/28921196/pexels-photo-28921196.jpeg?auto=compress&cs=tinysrgb&h=400&w=400');
      setStep('options');
      showToast('Lista detectada: 6 útiles escolares encontrados', 'success');
    }, 2400);
  };

  const handleReset = () => {
    setStep('capture');
    setCapturedImage(null);
    setSelectedTier(null);
    setCustomerName('');
    setGrade('');
    setPackItems([]);
    setCurrentPackIndex(0);
    setCheckoutDone(false);
    setEditableItems([]);
  };

  const handleSelectTier = (tier: Tier) => {
    setSelectedTier(tier);
    const opt = quoteOptions.find((o) => o.tier === tier)!;
    setEditableItems(opt.items.map((i) => ({ ...i })));
    setStep('detail');
  };

  const startEnpaque = () => {
    if (editableItems.length === 0) {
      showToast('No hay productos para enpaquetar', 'error');
      return;
    }
    const items: PackItem[] = editableItems.map((i) => ({
      product: i.product,
      quantity: i.quantity,
      packed: false,
      scanned: false,
    }));
    setPackItems(items);
    setCurrentPackIndex(0);
    setStep('enpaque');
  };

  const handleScanBarcode = () => {
    const item = packItems[currentPackIndex];
    if (!item || !item.product.hasBarcode) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setPackItems((prev) => prev.map((it, idx) =>
        idx === currentPackIndex ? { ...it, scanned: true, packed: true } : it
      ));
      showToast(`${item.product.name} escaneado y enpaquetado`, 'success');
    }, 1200);
  };

  const handleConfirmLooseItem = () => {
    const item = packItems[currentPackIndex];
    if (!item) return;
    setPackItems((prev) => prev.map((it, idx) =>
      idx === currentPackIndex ? { ...it, packed: true } : it
    ));
    showToast(`${item.quantity}x ${item.product.name} confirmado en bolsa`, 'success');
  };

  const goToNextPackItem = () => {
    if (currentPackIndex < packItems.length - 1) {
      setCurrentPackIndex(currentPackIndex + 1);
    } else {
      setStep('checkout');
    }
  };

  const currentItem = packItems[currentPackIndex];
  const canAdvance = currentItem ? (currentItem.product.hasBarcode ? currentItem.scanned : currentItem.packed) : false;

  const handleAddExtraProduct = (product: Product) => {
    setPackItems((prev) => [...prev, { product, quantity: 1, packed: false, scanned: !product.hasBarcode }]);
    showToast(`${product.name} agregado a la lista`, 'success');
    setExtraProductModal(false);
    setExtraSearch('');
  };

  const handleRemoveFromDetail = (idx: number) => {
    const item = editableItems[idx];
    setEditableItems((prev) => prev.filter((_, i) => i !== idx));
    showToast(`${item.product.name} quitado de la lista`, 'info');
  };

  const handleRemoveFromPack = (idx: number) => {
    const item = packItems[idx];
    const newItems = packItems.filter((_, i) => i !== idx);
    if (newItems.length === 0) {
      setPackItems([]);
      setStep('detail');
      showToast('Lista vacía. Volviendo a la lista detallada.', 'info');
      return;
    }
    setPackItems(newItems);
    if (idx < currentPackIndex) {
      setCurrentPackIndex((prev) => prev - 1);
    } else if (idx === currentPackIndex && currentPackIndex >= newItems.length) {
      setCurrentPackIndex(Math.max(0, newItems.length - 1));
    }
    showToast(`${item.product.name} quitado de la bolsa`, 'info');
  };

  const openSwap = (context: 'detail' | 'pack', idx: number) => {
    setSwapContext(context);
    setSwapTargetIndex(idx);
    setSwapSearch('');
    setSwapModalOpen(true);
  };

  const handleSwapProduct = (newProduct: Product) => {
    if (swapTargetIndex === null || !swapContext) return;
    if (swapContext === 'detail') {
      setEditableItems((prev) => prev.map((it, i) =>
        i === swapTargetIndex ? { ...it, product: newProduct } : it
      ));
      showToast(`${newProduct.name} intercambiado en la lista`, 'success');
    } else if (swapContext === 'pack') {
      setPackItems((prev) => prev.map((it, i) =>
        i === swapTargetIndex ? { ...it, product: newProduct, packed: false, scanned: false } : it
      ));
      showToast(`${newProduct.name} intercambiado en enpaque`, 'success');
    }
    setSwapModalOpen(false);
    setSwapTargetIndex(null);
    setSwapContext(null);
  };

  const handleFinalizeSale = () => {
    if (packItems.length === 0) {
      showToast('No hay productos para vender', 'error');
      return;
    }
    if (!paymentMethod) {
      showToast('Selecciona un método de pago', 'error');
      return;
    }

    setProducts((prev) => prev.map((p) => {
      const packItem = packItems.find((pi) => pi.product.id === p.id);
      if (packItem) {
        return { ...p, stock: Math.max(0, p.stock - packItem.quantity) };
      }
      return p;
    }));

    const sale = {
      id: 's' + Date.now(),
      items: packItems.map((pi) => ({
        productId: pi.product.id,
        name: pi.product.name,
        quantity: pi.quantity,
        price: pi.product.price,
      })),
      total: packItems.reduce((sum, pi) => sum + pi.product.price * pi.quantity, 0),
      paymentMethod: paymentMethod as PaymentMethod,
      createdAt: new Date().toISOString(),
      cashier: authUser?.name ?? 'Trabajador',
      customerName: customerName || 'Cliente mostrador',
    };
    setSales((prev) => [...prev, sale]);

    const newList = {
      id: 'sl' + Date.now(),
      customerName: customerName || 'Cliente mostrador',
      school: 'No especificado',
      grade: grade || 'No especificado',
      items: packItems.map((pi) => ({
        name: pi.product.name,
        quantity: pi.quantity,
        productId: pi.product.id,
        picked: true,
      })),
      status: 'completada' as const,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSchoolLists((prev) => [...prev, newList]);

    setCheckoutDone(true);
    setPaymentMethod('');
    showToast('¡Venta finalizada! Boleta impresa. Inventario actualizado.', 'success');
  };

  const extraCandidates = useMemo(() => {
    const existingIds = new Set(packItems.map((pi) => pi.product.id));
    return products.filter((p) =>
      p.active &&
      !existingIds.has(p.id) &&
      (extraSearch === '' || p.name.toLowerCase().includes(extraSearch.toLowerCase()))
    ).slice(0, 8);
  }, [products, packItems, extraSearch]);

  const swapCandidates = useMemo(() => {
    if (swapTargetIndex === null || !swapContext) return [];
    let currentProduct: Product;
    if (swapContext === 'pack') {
      currentProduct = packItems[swapTargetIndex].product;
    } else {
      currentProduct = editableItems[swapTargetIndex].product;
    }
    return products.filter((p) =>
      p.active &&
      p.id !== currentProduct.id &&
      (swapSearch === '' || p.name.toLowerCase().includes(swapSearch.toLowerCase()))
    ).slice(0, 8);
  }, [swapTargetIndex, products, editableItems, packItems, swapContext, swapSearch]);

  const swapModal = (
    <Modal open={swapModalOpen} onClose={() => { setSwapModalOpen(false); setSwapTargetIndex(null); setSwapContext(null); }} title="Intercambiar Producto" maxWidth="max-w-md">
      <SwapModalContent
        swapCandidates={swapCandidates}
        swapSearch={swapSearch}
        setSwapSearch={setSwapSearch}
        onSwap={handleSwapProduct}
      />
    </Modal>
  );

  // ===== STEP: CAPTURE =====
  if (step === 'capture') {
    return (
      <div className="px-4 pt-4 pb-24 space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-secondary-900">Cotización Inteligente y Enpaque</h2>
          <p className="text-sm text-secondary-500 mt-1">Escanea la lista y obtén 3 opciones al instante</p>
        </div>

        <button
          onClick={handleCapture}
          className="w-full bg-white rounded-3xl card-shadow hover:card-shadow-md active:scale-[0.98] transition-all p-8 flex flex-col items-center gap-4 border-2 border-dashed border-primary-200 hover:border-primary-400 group"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center group-hover:scale-110 transition-transform ring-1 ring-primary-100">
            <Camera className="w-10 h-10 text-primary-600" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-secondary-900">Escanear Lista por Foto</p>
            <p className="text-xs text-secondary-400 mt-1">Toma una foto de la lista de útiles (manuscrita o impresa)</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-primary-500 bg-primary-50 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Detección automática con IA
          </span>
        </button>

        {schoolLists.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wide mb-3">Listas recientes</p>
            <div className="space-y-2">
              {schoolLists.slice(0, 3).map((list) => {
                const picked = list.items.filter((i) => i.picked).length;
                const total = list.items.length;
                return (
                  <div key={list.id} className="flex items-center gap-3 bg-white rounded-xl p-3 card-shadow">
                    <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                      <School className="w-4 h-4 text-accent-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">{list.customerName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-secondary-400 mt-0.5">
                        <span>{list.school}</span><span>•</span><span>{list.grade}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-secondary-600">{picked}/{total}</p>
                      <p className="text-[10px] text-secondary-400">items</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-primary-50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-primary-700 mb-2 flex items-center gap-1.5">
            <ScanLine className="w-4 h-4" /> Cómo funciona
          </p>
          <div className="space-y-1.5 text-xs text-primary-600">
            <p className="flex items-start gap-2"><span className="font-bold">1.</span> Toma una foto clara de la lista</p>
            <p className="flex items-start gap-2"><span className="font-bold">2.</span> Compara 3 opciones: económica, estándar y premium</p>
            <p className="flex items-start gap-2"><span className="font-bold">3.</span> Quita o cambia productos que no quieras</p>
            <p className="flex items-start gap-2"><span className="font-bold">4.</span> Inicia el enpaque validado artículo por artículo</p>
            <p className="flex items-start gap-2"><span className="font-bold">5.</span> Imprime la boleta y finaliza la venta</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== STEP: PROCESSING =====
  if (step === 'processing') {
    return (
      <div className="px-4 pt-4 pb-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-primary-100 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full bg-primary-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-secondary-900 mb-1">Procesando lista...</h3>
        <p className="text-sm text-secondary-400 text-center max-w-xs">Detectando productos y comparando precios en nuestra base de datos</p>
        <div className="mt-6 space-y-2 w-full max-w-xs">
          <ProcessingLine label="Leyendo imagen" delay={0} />
          <ProcessingLine label="Identificando útiles" delay={500} />
          <ProcessingLine label="Buscando productos" delay={1000} />
          <ProcessingLine label="Generando cotizaciones" delay={1600} />
        </div>
      </div>
    );
  }

  // ===== STEP: OPTIONS (3 cards) =====
  if (step === 'options') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-3 bg-white border-b border-secondary-100 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-secondary-100 ring-1 ring-secondary-200">
              {capturedImage && <img src={capturedImage} alt="Lista" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-success-600 mb-1">
                <Check className="w-4 h-4" /><span className="text-xs font-semibold">Lista analizada</span>
              </div>
              <p className="text-sm font-bold text-secondary-900">{detectedItems.length} útiles detectados</p>
              <p className="text-xs text-secondary-400 mt-0.5">Elige una opción de cotización</p>
            </div>
            <button onClick={handleReset} className="w-8 h-8 rounded-lg text-secondary-400 hover:text-danger-600 hover:bg-danger-50 flex items-center justify-center transition-colors flex-shrink-0">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wide">3 Opciones de Cotización</p>
          {quoteOptions.map((opt, idx) => {
            const meta = TIER_META[opt.tier];
            const Icon = meta.icon;
            return (
              <button
                key={opt.tier}
                onClick={() => handleSelectTier(opt.tier)}
                className={`w-full bg-white rounded-2xl p-4 card-shadow hover:card-shadow-md active:scale-[0.98] transition-all text-left border-2 ${meta.border} animate-slide-up`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${meta.bg} flex items-center justify-center flex-shrink-0 ring-1 ${meta.ring}`}>
                    <Icon className={`w-7 h-7 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-secondary-900">Opción {meta.label}</p>
                    <p className="text-xs text-secondary-400 mt-0.5">{meta.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-lg font-bold text-secondary-900">S/ {opt.total.toFixed(2)}</span>
                      <span className="text-xs text-secondary-400">{opt.items.reduce((s, i) => s + i.quantity, 0)} artículos</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-secondary-300 flex-shrink-0" />
                </div>
              </button>
            );
          })}

          <div className="bg-secondary-50 rounded-2xl p-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary-500 mb-2">
              <TrendingUp className="w-3.5 h-3.5" /> Comparación de precios
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-success-600 font-medium">Min: S/ {totalEconomica.toFixed(2)}</span>
              <span className="text-secondary-400">→</span>
              <span className="text-accent-600 font-medium">Max: S/ {totalPremium.toFixed(2)}</span>
              <span className="text-secondary-400">→</span>
              <span className="text-success-600 font-bold">Ahorro: S/ {(totalPremium - totalEconomica).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== STEP: DETAIL (selected option full list) =====
  if (step === 'detail' && selectedOption) {
    const meta = TIER_META[selectedOption.tier];
    const Icon = meta.icon;
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-3 bg-white border-b border-secondary-100 flex-shrink-0">
          <button onClick={() => setStep('options')} className="flex items-center gap-1.5 text-sm text-primary-600 font-medium mb-3">
            <ArrowLeft className="w-4 h-4" /> Volver a opciones
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0 ring-1 ${meta.ring}`}>
              <Icon className={`w-6 h-6 ${meta.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-secondary-900">Opción {meta.label}</p>
              <p className="text-xs text-secondary-400">{meta.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-secondary-900">S/ {detailTotal.toFixed(2)}</p>
              <p className="text-xs text-secondary-400">{editableItems.reduce((s, i) => s + i.quantity, 0)} artículos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-lg border border-secondary-200 focus:border-primary-500 outline-none"
              placeholder="Nombre del cliente"
            />
            <input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-24 px-2.5 py-1.5 text-xs rounded-lg border border-secondary-200 focus:border-primary-500 outline-none"
              placeholder="Grado"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-2">
          {editableItems.length === 0 && (
            <div className="text-center py-12 text-secondary-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No hay productos en la lista</p>
              <p className="text-xs mt-1">Vuelve y elige otra opción</p>
            </div>
          )}
          {editableItems.map((item, idx) => {
            const subtotal = item.product.price * item.quantity;
            return (
              <div key={idx} className="bg-white rounded-xl p-3 card-shadow">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setImageViewer({ src: getProductImage(item.product.subcategory), name: item.product.name, price: item.product.price })}
                    className="w-14 h-14 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0 ring-1 ring-secondary-200 active:scale-95 transition-transform"
                  >
                    <img src={getProductImage(item.product.subcategory)} alt={item.product.name} className="w-full h-full object-cover" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 leading-snug">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-secondary-400">Cant: {item.quantity}</span>
                      <span className="text-xs text-secondary-300">•</span>
                      <span className="text-xs text-secondary-500">S/ {item.product.price.toFixed(2)} c/u</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {item.product.hasBarcode ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-full">
                          <Barcode className="w-2.5 h-2.5" /> Con código
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-secondary-500 bg-secondary-100 px-1.5 py-0.5 rounded-full">
                          <Package className="w-2.5 h-2.5" /> Suelto
                        </span>
                      )}
                      {item.product.stock <= item.product.minStock && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-warning-600 bg-warning-50 px-1.5 py-0.5 rounded-full">
                          <AlertCircle className="w-2.5 h-2.5" /> Stock: {item.product.stock}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-sm font-bold text-secondary-900">S/ {subtotal.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openSwap('detail', idx)}
                        className="flex items-center gap-0.5 text-[10px] font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Cambiar
                      </button>
                      <button
                        onClick={() => handleRemoveFromDetail(idx)}
                        className="flex items-center gap-0.5 text-[10px] font-medium text-danger-600 bg-danger-50 hover:bg-danger-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border-t border-secondary-100 px-4 py-3 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-secondary-400">Total opción {meta.label}</p>
            <p className="text-2xl font-bold text-secondary-900">S/ {detailTotal.toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => showToast('Puedes quitar o cambiar productos con los botones de cada artículo', 'info')}
              className="flex items-center justify-center gap-1.5 bg-secondary-100 hover:bg-secondary-200 active:scale-95 text-secondary-700 rounded-xl py-3 transition-all text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Editar lista
            </button>
            <button
              onClick={startEnpaque}
              disabled={editableItems.length === 0}
              className="flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl py-3 transition-all text-sm font-bold disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" /> Iniciar Enpaque
            </button>
          </div>
        </div>

        {swapModal}
      </div>
    );
  }

  // ===== STEP: ENPAQUE (pack validation) =====
  if (step === 'enpaque' && currentItem) {
    const packedCount = packItems.filter((i) => i.packed).length;
    const totalCount = packItems.length;
    const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;
    const hasBarcode = currentItem.product.hasBarcode;
    const isLastItem = currentPackIndex === packItems.length - 1;

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-3 bg-white border-b border-secondary-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-secondary-900">Enpaque Inteligente</p>
              <p className="text-xs text-secondary-400">Valida cada artículo en la bolsa</p>
            </div>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
              {packedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
            <div className="h-full bg-success-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
          <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wide mb-3">
            Artículo {currentPackIndex + 1} de {totalCount}
          </p>

          <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
            <div className="flex items-start gap-3 mb-3">
              <button
                onClick={() => setImageViewer({ src: getProductImage(currentItem.product.subcategory), name: currentItem.product.name, price: currentItem.product.price })}
                className="w-20 h-20 rounded-xl overflow-hidden bg-secondary-100 flex-shrink-0 ring-1 ring-secondary-200 active:scale-95 transition-transform"
              >
                <img src={getProductImage(currentItem.product.subcategory)} alt={currentItem.product.name} className="w-full h-full object-cover" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-secondary-900 leading-snug">{currentItem.product.name}</p>
                <p className="text-xs text-secondary-400 mt-1">Cantidad: {currentItem.quantity}</p>
                <p className="text-xs text-secondary-500 mt-0.5">S/ {currentItem.product.price.toFixed(2)} c/u — Subtotal: S/ {(currentItem.product.price * currentItem.quantity).toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => openSwap('pack', currentPackIndex)}
                  className="flex items-center justify-center text-primary-600 bg-primary-50 hover:bg-primary-100 p-1.5 rounded-lg transition-colors"
                  title="Intercambiar producto"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveFromPack(currentPackIndex)}
                  className="flex items-center justify-center text-danger-600 bg-danger-50 hover:bg-danger-100 p-1.5 rounded-lg transition-colors"
                  title="Quitar de la lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`rounded-xl p-3 ${hasBarcode ? 'bg-primary-50' : 'bg-secondary-50'}`}>
              <div className="flex items-center gap-2">
                {hasBarcode ? (
                  <>
                    <Barcode className={`w-5 h-5 ${currentItem.scanned ? 'text-success-600' : 'text-primary-600'}`} />
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${currentItem.scanned ? 'text-success-700' : 'text-primary-700'}`}>
                        {currentItem.scanned ? 'Código escaneado correctamente' : 'Producto con código de barras'}
                      </p>
                      <p className="text-[10px] text-secondary-500 mt-0.5">
                        {currentItem.scanned ? 'Artículo validado y en bolsa' : 'Escanea el código para continuar'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 text-secondary-500" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-secondary-700">Artículo suelto sin código</p>
                      <p className="text-[10px] text-secondary-500 mt-0.5">Confirma que lo metiste a la bolsa</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {!currentItem.packed ? (
            hasBarcode ? (
              <button
                onClick={handleScanBarcode}
                disabled={scanning}
                className={`w-full rounded-2xl py-5 transition-all flex flex-col items-center gap-2 ${
                  scanning ? 'bg-primary-400 text-white' : 'bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white'
                }`}
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm font-bold">Escaneando código...</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="w-8 h-8" />
                    <span className="text-sm font-bold">Escanear Código de Barras</span>
                    <span className="text-[10px] text-primary-100">Apunta la cámara al código del producto</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleConfirmLooseItem}
                className="w-full bg-success-600 hover:bg-success-700 active:scale-[0.98] text-white rounded-2xl py-5 transition-all flex flex-col items-center gap-2"
              >
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-sm font-bold">Confirmar en Bolsa</span>
                <span className="text-[10px] text-success-100">{currentItem.quantity} unidades — se descontarán al finalizar</span>
              </button>
            )
          ) : (
            <div className="bg-success-50 border border-success-200 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-success-700">¡Artículo enpaquetado!</p>
              <p className="text-xs text-success-600 mt-0.5">{currentItem.product.name}</p>
            </div>
          )}

          {packedCount > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wide mb-2">En bolsa</p>
              <div className="space-y-1.5">
                {packItems.filter((i) => i.packed).map((item) => {
                  const realIdx = packItems.indexOf(item);
                  return (
                    <div key={realIdx} className="flex items-center gap-2 bg-white rounded-lg p-2 card-shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />
                      <span className="text-xs text-secondary-700 flex-1 truncate">{item.quantity}x {item.product.name}</span>
                      {item.product.hasBarcode && item.scanned && <Barcode className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />}
                      <button
                        onClick={() => openSwap('pack', realIdx)}
                        className="text-primary-500 hover:text-primary-700 p-1 rounded transition-colors flex-shrink-0"
                        title="Intercambiar"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromPack(realIdx)}
                        className="text-danger-500 hover:text-danger-700 p-1 rounded transition-colors flex-shrink-0"
                        title="Quitar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={() => { setExtraSearch(''); setExtraProductModal(true); }}
            className="w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Agregar otros productos
          </button>
        </div>

        <div className="bg-white border-t border-secondary-100 px-4 py-3 flex-shrink-0">
          {canAdvance && currentItem.packed ? (
            <button
              onClick={goToNextPackItem}
              className="w-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl py-3.5 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              {isLastItem ? (
                <><ShieldCheck className="w-5 h-5" /> Finalizar Enpaque — Ir a Cierre</>
              ) : (
                <>Siguiente Artículo <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          ) : (
            <div className="w-full bg-secondary-100 text-secondary-400 rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm font-medium">
              <Lock className="w-4 h-4" />
              {hasBarcode ? 'Escanea el código para continuar' : 'Confirma el artículo para continuar'}
            </div>
          )}
        </div>

        <Modal open={extraProductModal} onClose={() => setExtraProductModal(false)} title="Agregar otros productos" maxWidth="max-w-md">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                value={extraSearch}
                onChange={(e) => setExtraSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
                placeholder="Buscar producto..."
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {extraCandidates.length === 0 && (
                <div className="text-center py-6 text-secondary-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No se encontraron productos</p>
                </div>
              )}
              {extraCandidates.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAddExtraProduct(p)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary-50 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0 ring-1 ring-secondary-200">
                    <img src={getProductImage(p.subcategory)} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">{p.name}</p>
                    <p className="text-xs text-secondary-400">Stock: {p.stock}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-secondary-900">S/ {p.price.toFixed(2)}</p>
                    <Plus className="w-4 h-4 text-primary-400 ml-auto mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Modal>

        {swapModal}
      </div>
    );
  }

  // ===== STEP: CHECKOUT =====
  if (step === 'checkout') {
    const total = packItems.reduce((sum, pi) => sum + pi.product.price * pi.quantity, 0);
    const totalItems = packItems.reduce((sum, pi) => sum + pi.quantity, 0);
    const barcodeItems = packItems.filter((pi) => pi.product.hasBarcode).length;
    const looseItems = packItems.filter((pi) => !pi.product.hasBarcode).length;

    if (checkoutDone) {
      return (
        <div className="px-4 pt-4 pb-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 rounded-full bg-success-50 flex items-center justify-center mb-6 ring-4 ring-success-100 animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-secondary-900 mb-2">¡Venta Finalizada!</h2>
          <p className="text-sm text-secondary-400 max-w-xs mb-6">La boleta ha sido impresa y el inventario actualizado correctamente.</p>
          <div className="bg-white rounded-2xl p-4 card-shadow w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-400">Total venta</span>
              <span className="font-bold text-secondary-900">S/ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-400">Artículos</span>
              <span className="font-medium text-secondary-700">{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-400">Con código</span>
              <span className="font-medium text-secondary-700">{barcodeItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-400">Sueltos</span>
              <span className="font-medium text-secondary-700">{looseItems}</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="mt-6 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl px-8 py-3 transition-all font-bold text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Nueva Cotización
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-3 bg-white border-b border-secondary-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-success-600" />
            <p className="text-sm font-bold text-secondary-900">Cierre de Venta</p>
          </div>
          <p className="text-xs text-secondary-400">Enpaque completado — {packItems.length} productos validados</p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wide mb-3">Artículos enpaquetados</p>
            <div className="space-y-2">
              {packItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <button
                    onClick={() => setImageViewer({ src: getProductImage(item.product.subcategory), name: item.product.name, price: item.product.price })}
                    className="w-10 h-10 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0 ring-1 ring-secondary-200 active:scale-95 transition-transform"
                  >
                    <img src={getProductImage(item.product.subcategory)} alt={item.product.name} className="w-full h-full object-cover" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-secondary-900 truncate">{item.quantity}x {item.product.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {item.product.hasBarcode ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-full">
                          <Barcode className="w-2 h-2" /> Escaneado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-secondary-500 bg-secondary-100 px-1.5 py-0.5 rounded-full">
                          <Package className="w-2 h-2" /> Confirmado
                        </span>
                      )}
                      <span className="text-[9px] text-success-600 font-medium">✓ En bolsa</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openSwap('pack', idx)}
                      className="text-primary-500 hover:text-primary-700 p-1 rounded transition-colors"
                      title="Intercambiar"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const newItems = packItems.filter((_, i) => i !== idx);
                        if (newItems.length === 0) {
                          setStep('enpaque');
                          setPackItems([]);
                          showToast('Lista vacía. Volviendo al enpaque.', 'info');
                        } else {
                          setPackItems(newItems);
                          showToast(`${item.product.name} quitado`, 'info');
                        }
                      }}
                      className="text-danger-500 hover:text-danger-700 p-1 rounded transition-colors"
                      title="Quitar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-secondary-900 flex-shrink-0">S/ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-secondary-500">Subtotal</span>
              <span className="text-sm text-secondary-700">S/ {total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-secondary-500">Artículos totales</span>
              <span className="text-sm text-secondary-700">{totalItems} unidades</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
              <span className="text-base font-bold text-secondary-900">Total a cobrar</span>
              <span className="text-2xl font-bold text-primary-600">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-primary-50 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-primary-700">Inventario se actualizará automáticamente</p>
                <p className="text-[10px] text-primary-500 mt-0.5">
                  {barcodeItems} productos con código y {looseItems} sueltos se descontarán de la base de datos al finalizar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-secondary-100 px-4 py-3 flex-shrink-0 space-y-3">
          <div>
            <p className="text-xs font-semibold text-secondary-500 mb-2">Método de pago</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('efectivo')}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                  paymentMethod === 'efectivo'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-[10px] font-medium">Efectivo</span>
              </button>
              <button
                onClick={() => setPaymentMethod('yape_plin')}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                  paymentMethod === 'yape_plin'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[10px] font-medium">Yape/Plin</span>
              </button>
            </div>
            {paymentMethod === 'yape_plin' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => setShowQrModal('yape')}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 text-secondary-700 transition-all active:scale-95"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Ver QR Yape</span>
                </button>
                <button
                  onClick={() => setShowQrModal('plin')}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 text-secondary-700 transition-all active:scale-95"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Ver QR Plin</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleFinalizeSale}
            disabled={packItems.length === 0 || !paymentMethod}
            className="w-full bg-success-600 hover:bg-success-700 active:scale-95 text-white rounded-xl py-4 transition-all flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50"
          >
            <Printer className="w-5 h-5" /> Imprimir Boleta / Finalizar Venta
          </button>
          <button
            onClick={() => setStep('enpaque')}
            className="w-full text-secondary-400 hover:text-secondary-600 text-xs font-medium py-1 transition-colors"
          >
            Volver al enpaque
          </button>
        </div>

        {swapModal}

        <Modal
          open={showQrModal !== null}
          onClose={() => setShowQrModal(null)}
          title={showQrModal === 'yape' ? 'Pagar con Yape' : 'Pagar con Plin'}
          maxWidth="max-w-xs"
        >
          <div className="flex flex-col items-center gap-4 py-2">
            <div className={`w-48 h-48 rounded-2xl p-3 ${showQrModal === 'yape' ? 'bg-[#7B2C8F]' : 'bg-[#00A0DF]'} flex items-center justify-center`}>
              <div className="bg-white rounded-xl p-2 w-full h-full flex items-center justify-center">
                <QRCodeSVG
                  value={showQrModal === 'yape'
                    ? 'https://www.yape.pe/pagar/YAPE_999888777'
                    : 'https://www.plin.pe/pagar/PLIN_999888777'}
                  size={160}
                  level="M"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-secondary-900">
                Total a pagar: S/ {total.toFixed(2)}
              </p>
              <p className="text-xs text-secondary-400 mt-1">
                Escanea el código con {showQrModal === 'yape' ? 'Yape' : 'Plin'} para pagar
              </p>
            </div>
            <button
              onClick={() => setShowQrModal(null)}
              className="w-full bg-success-600 hover:bg-success-700 active:scale-95 text-white rounded-xl py-3 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Check className="w-4 h-4" /> Ya pagué — continuar
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  if (imageViewer) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-secondary-900/90 backdrop-blur-md animate-fade-in p-4"
        onClick={() => setImageViewer(null)}
      >
        <button
          onClick={() => setImageViewer(null)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="aspect-square w-full bg-secondary-100 overflow-hidden">
            <img src={imageViewer.src} alt={imageViewer.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-5 text-center">
            <p className="text-base font-bold text-secondary-900">{imageViewer.name}</p>
            <p className="text-2xl font-bold text-primary-600 mt-2">S/ {imageViewer.price.toFixed(2)}</p>
            <button
              onClick={() => setImageViewer(null)}
              className="mt-4 w-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl py-3 transition-all font-bold text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function SwapModalContent({
  swapCandidates, swapSearch, setSwapSearch, onSwap,
}: {
  swapCandidates: Product[];
  swapSearch: string;
  setSwapSearch: (v: string) => void;
  onSwap: (p: Product) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
        <input
          value={swapSearch}
          onChange={(e) => setSwapSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
          placeholder="Buscar producto para intercambiar..."
        />
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {swapCandidates.length === 0 && (
          <div className="text-center py-6 text-secondary-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay productos disponibles</p>
          </div>
        )}
        {swapCandidates.map((p) => (
          <button
            key={p.id}
            onClick={() => onSwap(p)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary-50 transition-colors text-left active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0 ring-1 ring-secondary-200">
              <img src={getProductImage(p.subcategory)} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">{p.name}</p>
              <p className="text-xs text-secondary-400">Stock: {p.stock}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-secondary-900">S/ {p.price.toFixed(2)}</p>
              <ArrowRight className="w-4 h-4 text-primary-400 ml-auto mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProcessingLine({ label, delay }: { label: string; delay: number }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDone(true), delay + 300);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div className="flex items-center gap-2 text-xs">
      {done ? (
        <Check className="w-4 h-4 text-success-500" />
      ) : (
        <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
      )}
      <span className={done ? 'text-secondary-600' : 'text-secondary-400'}>{label}</span>
    </div>
  );
}
