import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, getSubcategories, getCategoryName, getSubcategoryName, BRANDS } from '../../data/categories';
import { getSubcategoryImage } from '../../data/productImages';
import { CategoryIcon } from '../CategoryIcon';
import {
  ScanLine, Wand2, Barcode, Package, Tag, DollarSign, Boxes,
  Printer, Check, ChevronRight, Camera, Layers, Award,
} from 'lucide-react';
import type { MainCategoryId, Product } from '../../types';

export function ScannerTab() {
  const { products, setProducts, showToast } = useApp();
  const [scanning, setScanning] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<MainCategoryId | ''>('');
  const [subcategory, setSubcategory] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcatOpen, setSubcatOpen] = useState(false);
  const [brand, setBrand] = useState('');
  const [brandOpen, setBrandOpen] = useState(false);
  const [formMode, setFormMode] = useState<'scan' | 'generate' | null>(null);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const code = 'AUTO' + Math.floor(1000000 + Math.random() * 9000000);
      setBarcode(code);
      setScanning(false);
      setFormMode('scan');
      setFormOpen(true);
      showToast('Código escaneado: ' + code, 'info');
    }, 1500);
  };

  const handleGenerateCode = () => {
    const code = 'INT' + Date.now().toString().slice(-8);
    setBarcode(code);
    setFormMode('generate');
    setFormOpen(true);
    showToast('Código interno generado: ' + code, 'info');
  };

  const handleSave = () => {
    if (!barcode || !category || !subcategory || !name || !brand || !price || !stock) {
      showToast('Completa todos los campos', 'error');
      return;
    }
    const newProduct: Product = {
      id: 'p' + Date.now(),
      barcode,
      name,
      category: category as MainCategoryId,
      subcategory,
      brand,
      price: parseFloat(price),
      stock: parseInt(stock),
      minStock: 10,
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      hasBarcode: true,
    };
    setProducts((prev) => [...prev, newProduct]);
    if (formMode === 'generate') {
      showToast('Producto guardado. Enviando a impresora térmica Bluetooth... ¡Etiqueta impresa!', 'success');
    } else {
      showToast('Producto guardado correctamente', 'success');
    }
    resetForm();
  };

  const resetForm = () => {
    setBarcode('');
    setCategory('');
    setSubcategory('');
    setBrand('');
    setName('');
    setPrice('');
    setStock('');
    setFormOpen(false);
    setFormMode(null);
    setCategoryOpen(false);
    setSubcatOpen(false);
    setBrandOpen(false);
  };

  const handleSelectCategory = (catId: MainCategoryId) => {
    setCategory(catId);
    setSubcategory('');
    setSubcatOpen(true);
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-secondary-900">Escáner / Alta Rápida</h2>
        <p className="text-sm text-secondary-500 mt-1">Registra productos al instante</p>
      </div>

      {/* Camera simulation */}
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
            <p className="text-sm">Vista previa de cámara</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex flex-col items-center gap-2 bg-primary-600 hover:bg-primary-700 active:scale-95 disabled:opacity-60 text-white rounded-xl py-4 font-medium transition-all"
        >
          <ScanLine className="w-6 h-6" />
          <span className="text-sm">{scanning ? 'Escaneando...' : 'Escanear'}</span>
        </button>
        <button
          onClick={handleGenerateCode}
          className="flex flex-col items-center gap-2 bg-secondary-100 hover:bg-secondary-200 active:scale-95 text-secondary-700 rounded-xl py-4 font-medium transition-all"
        >
          <Wand2 className="w-6 h-6" />
          <span className="text-sm">Generar Código</span>
        </button>
      </div>

      {/* Cascade form */}
      {formOpen && (
        <div className="bg-white rounded-2xl p-4 space-y-4 animate-slide-up card-shadow">
          <div className="flex items-center gap-2 text-primary-600 font-semibold">
            <Package className="w-5 h-5" />
            <span>Nuevo Producto</span>
          </div>

          {/* Barcode field */}
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
              <Barcode className="w-3.5 h-3.5" /> Código de barras / interno
            </label>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              placeholder="Ej. 7501234567890"
            />
          </div>

          {/* Main category selector */}
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Categoría principal
            </label>
            <button
              onClick={() => { setCategoryOpen(!categoryOpen); setSubcatOpen(false); }}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 outline-none text-sm text-left flex items-center justify-between transition-all"
            >
              <span className={category ? 'text-secondary-900' : 'text-secondary-400'}>
                {category ? getCategoryName(category) : 'Seleccionar categoría...'}
              </span>
              <ChevronRight className={`w-4 h-4 text-secondary-400 transition-transform ${categoryOpen ? 'rotate-90' : ''}`} />
            </button>
            {categoryOpen && (
              <div className="mt-2 space-y-1 animate-fade-in max-h-48 overflow-y-auto scrollbar-thin">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                      category === cat.id
                        ? 'bg-primary-50 text-primary-700 font-medium ring-1 ring-primary-200'
                        : 'hover:bg-secondary-50 text-secondary-700'
                    }`}
                  >
                    <CategoryIcon id={cat.id} className="w-4 h-4" />
                    {cat.name}
                    {category === cat.id && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subcategory selector */}
          {category && (
            <div className="animate-fade-in">
              <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Subcategoría
              </label>
              <button
                onClick={() => setSubcatOpen(!subcatOpen)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 outline-none text-sm text-left flex items-center justify-between transition-all"
              >
                <span className={subcategory ? 'text-secondary-900' : 'text-secondary-400'}>
                  {subcategory ? getSubcategoryName(category, subcategory) : 'Seleccionar subcategoría...'}
                </span>
                <ChevronRight className={`w-4 h-4 text-secondary-400 transition-transform ${subcatOpen ? 'rotate-90' : ''}`} />
              </button>
              {subcatOpen && (
                <div className="mt-2 space-y-1 animate-fade-in max-h-56 overflow-y-auto scrollbar-thin">
                  {getSubcategories(category).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { setSubcategory(sub.id); setSubcatOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                        subcategory === sub.id
                          ? 'bg-primary-50 text-primary-700 font-medium ring-1 ring-primary-200'
                          : 'hover:bg-secondary-50 text-secondary-700'
                      }`}
                    >
                      {sub.name}
                      {subcategory === sub.id && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Brand selector */}
          {subcategory && (
            <div className="animate-fade-in">
              <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Marca
              </label>
              <button
                onClick={() => setBrandOpen(!brandOpen)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 outline-none text-sm text-left flex items-center justify-between transition-all"
              >
                <span className={brand ? 'text-secondary-900' : 'text-secondary-400'}>
                  {brand ? brand : 'Seleccionar marca...'}
                </span>
                <ChevronRight className={`w-4 h-4 text-secondary-400 transition-transform ${brandOpen ? 'rotate-90' : ''}`} />
              </button>
              {brandOpen && (
                <div className="mt-2 space-y-1 animate-fade-in max-h-48 overflow-y-auto scrollbar-thin">
                  {BRANDS.map((b) => (
                    <button
                      key={b}
                      onClick={() => { setBrand(b); setBrandOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                        brand === b
                          ? 'bg-primary-50 text-primary-700 font-medium ring-1 ring-primary-200'
                          : 'hover:bg-secondary-50 text-secondary-700'
                      }`}
                    >
                      {b}
                      {brand === b && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Nombre del producto
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              placeholder="Ej. Bolígrafo Pilot Azul"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Precio venta
              </label>
              <input
                type="number"
                step="0.10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5" /> Stock inicial
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-success-600 hover:bg-success-700 active:scale-95 text-white rounded-xl py-3 font-semibold transition-all"
          >
            {formMode === 'generate' ? (
              <>
                <Printer className="w-5 h-5" />
                Guardar e Imprimir Etiqueta
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Guardar
              </>
            )}
          </button>
        </div>
      )}

      {/* Recent products */}
      <div>
        <h3 className="text-sm font-semibold text-secondary-700 mb-2">Productos recientes</h3>
        <div className="space-y-2">
          {products.slice(-4).reverse().map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-3 card-shadow">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-secondary-100">
                <img
                  src={getSubcategoryImage(p.subcategory)}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">{p.name}</p>
                <p className="text-xs text-secondary-400">{p.barcode} • {getCategoryName(p.category)} • {p.brand}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-secondary-900">S/ {p.price.toFixed(2)}</p>
                <p className="text-xs text-secondary-400">Stock: {p.stock}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
