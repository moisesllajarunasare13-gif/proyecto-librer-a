import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, getCategoryName, getSubcategoryName, getSubcategories, BRANDS } from '../../data/categories';
import { CategoryIcon } from '../CategoryIcon';
import { Modal } from '../Modal';
import {
  Search, Filter, Upload, Eye, EyeOff, AlertTriangle,
  Package, TrendingUp, TrendingDown, FileSpreadsheet, Award,
} from 'lucide-react';
import type { MainCategoryId } from '../../types';

export function CatalogTab() {
  const { products, setProducts, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcatFilter, setSubcatFilter] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!showInactive && !p.active) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (subcatFilter !== 'all' && p.subcategory !== subcatFilter) return false;
      if (brandFilter !== 'all' && p.brand !== brandFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.barcode.includes(search) && !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, search, categoryFilter, subcatFilter, brandFilter, showInactive]);

  const toggleActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    const product = products.find((p) => p.id === id);
    showToast(
      product?.active ? 'Producto descontinuado (soft delete)' : 'Producto reactivado',
      product?.active ? 'info' : 'success'
    );
  };

  const stats = {
    total: products.filter((p) => p.active).length,
    inactive: products.filter((p) => !p.active).length,
    lowStock: products.filter((p) => p.active && p.stock <= p.minStock).length,
    totalValue: products.filter((p) => p.active).reduce((sum, p) => sum + p.price * p.stock, 0),
  };

  const simulateBulkUpload = () => {
    const newProducts: { name: string; category: MainCategoryId; subcategory: string; brand: string; price: number; stock: number }[] = [
      { name: 'Cuaderno Profesional Rayado 150h', category: 'escolar', subcategory: 'cuadernos', brand: 'Norma', price: 8.90, stock: 60 },
      { name: 'Marcador Permanente Pilot Negro', category: 'escolar', subcategory: 'escritura', brand: 'Pilot', price: 4.50, stock: 80 },
      { name: 'Set Lápices de Colores 24u Crayola', category: 'escolar', subcategory: 'arte-diseno', brand: 'Crayola', price: 22.00, stock: 30 },
    ];
    newProducts.forEach((np) => {
      setProducts((prev) => [...prev, {
        id: 'bulk' + Date.now() + Math.random(),
        barcode: 'BULK' + Math.floor(Math.random() * 10000000),
        ...np,
        minStock: 10,
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
        hasBarcode: true,
      }]);
    });
    setBulkUploadOpen(false);
    showToast('Carga masiva completada: 3 productos importados', 'success');
  };

  const handleCategoryFilterChange = (catId: string) => {
    if (categoryFilter === catId) {
      setCategoryFilter('all');
      setSubcatFilter('all');
    } else {
      setCategoryFilter(catId);
      setSubcatFilter('all');
    }
  };

  const uniqueBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand));
    return BRANDS.filter((b) => brands.has(b));
  }, [products]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Catálogo de Productos</h2>
          <p className="text-sm text-secondary-500 mt-1">{stats.total} activos • {stats.inactive} inactivos</p>
        </div>
        <button
          onClick={() => setBulkUploadOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
        >
          <Upload className="w-4 h-4" /> Carga Masiva
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary-600" />
            <span className="text-xs text-secondary-500">Activos</span>
          </div>
          <p className="text-xl font-bold text-secondary-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <EyeOff className="w-4 h-4 text-secondary-400" />
            <span className="text-xs text-secondary-500">Inactivos</span>
          </div>
          <p className="text-xl font-bold text-secondary-900">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-warning-500" />
            <span className="text-xs text-secondary-500">Stock bajo</span>
          </div>
          <p className="text-xl font-bold text-warning-600">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-success-600" />
            <span className="text-xs text-secondary-500">Valor inventario</span>
          </div>
          <p className="text-xl font-bold text-secondary-900">S/ {stats.totalValue.toFixed(0)}</p>
        </div>
      </div>

      {/* Search & filters */}
      <div className="bg-white rounded-2xl p-4 card-shadow space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              placeholder="Buscar por nombre o código..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 rounded-lg border transition-all ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-600' : 'border-secondary-200 text-secondary-600 hover:bg-secondary-50'}`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-1.5 px-3 rounded-lg border text-sm transition-all ${showInactive ? 'bg-secondary-100 border-secondary-300 text-secondary-700' : 'border-secondary-200 text-secondary-500 hover:bg-secondary-50'}`}
          >
            {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{showInactive ? 'Ver todos' : 'Ocultar inactivos'}</span>
          </button>
        </div>

        {showFilters && (
          <div className="space-y-2 animate-fade-in">
            {/* Main categories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setCategoryFilter('all'); setSubcatFilter('all'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${categoryFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
              >
                Todas
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryFilterChange(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${categoryFilter === cat.id ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                >
                  <CategoryIcon id={cat.id} className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              ))}
            </div>
            {/* Subcategories (only if main category selected) */}
            {categoryFilter !== 'all' && (
              <div className="flex flex-wrap gap-2 pl-3 border-l-2 border-primary-200 animate-fade-in">
                <button
                  onClick={() => setSubcatFilter('all')}
                  className={`px-2.5 py-1 rounded-full text-xs transition-all ${subcatFilter === 'all' ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-secondary-50 text-secondary-500 hover:bg-secondary-100'}`}
                >
                  Todas las subcategorías
                </button>
                {getSubcategories(categoryFilter).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubcatFilter(sub.id)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${subcatFilter === sub.id ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-secondary-50 text-secondary-500 hover:bg-secondary-100'}`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
            {/* Brands */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-xs text-secondary-400 font-medium pt-1">
                <Award className="w-3 h-3" /> Marcas:
              </span>
              <button
                onClick={() => setBrandFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${brandFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
              >
                Todas
              </button>
              {uniqueBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(brandFilter === b ? 'all' : b)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${brandFilter === b ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="px-4 py-3 hidden lg:table-cell">Subcategoría</th>
                <th className="px-4 py-3 hidden xl:table-cell">Marca</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 hidden sm:table-cell">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {filtered.map((p) => {
                const lowStock = p.stock <= p.minStock;
                return (
                  <tr key={p.id} className={`hover:bg-secondary-50/50 transition-colors ${!p.active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon id={p.category} className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">{p.name}</p>
                          <p className="text-xs text-secondary-400">{p.barcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-secondary-600">{getCategoryName(p.category)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-secondary-500">{getSubcategoryName(p.category, p.subcategory)}</span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs font-medium text-secondary-600">{p.brand}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-secondary-900">S/ {p.price.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-medium ${lowStock ? 'text-warning-600' : 'text-secondary-700'}`}>{p.stock}</span>
                        {lowStock && p.stock > 0 && <AlertTriangle className="w-3 h-3 text-warning-500" />}
                        {p.stock === 0 && <TrendingDown className="w-3 h-3 text-danger-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.active ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">Activo</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-200 text-secondary-600">Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleActive(p.id)}
                        className={`p-1.5 rounded-lg transition-all hover:scale-110 ${p.active ? 'text-secondary-400 hover:text-warning-600 hover:bg-warning-50' : 'text-secondary-400 hover:text-success-600 hover:bg-success-50'}`}
                        title={p.active ? 'Descontinuar (soft delete)' : 'Reactivar'}
                      >
                        {p.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-secondary-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Bulk upload modal */}
      <Modal open={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)} title="Carga Masiva (Excel/CSV)">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-secondary-200 rounded-xl p-8 text-center">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
            <p className="text-sm font-medium text-secondary-700 mb-1">Arrastra tu archivo Excel o CSV</p>
            <p className="text-xs text-secondary-400">Formatos soportados: .xlsx, .csv</p>
          </div>
          <div className="bg-secondary-50 rounded-xl p-3">
            <p className="text-xs text-secondary-500 mb-1">Columnas requeridas:</p>
            <p className="text-xs font-mono text-secondary-600">codigo, nombre, categoria, subcategoria, marca, precio, stock</p>
          </div>
          <button
            onClick={simulateBulkUpload}
            className="w-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl py-3 font-semibold transition-all"
          >
            Simular Carga de 3 Productos
          </button>
        </div>
      </Modal>
    </div>
  );
}
