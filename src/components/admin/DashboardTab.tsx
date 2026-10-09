import { useApp } from '../../context/AppContext';
import { CATEGORIES, getCategoryName, getSubcategoryName } from '../../data/categories';
import { CategoryIcon } from '../CategoryIcon';
import {
  TrendingUp, DollarSign, ShoppingBag, ClipboardCheck,
  AlertTriangle, Package, ArrowUpRight, Calendar, Award,
} from 'lucide-react';
import { useMemo } from 'react';

export function DashboardTab() {
  const { sales, products, schoolLists } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const todaySales = useMemo(() =>
    sales.filter((s) => s.createdAt.startsWith(today)),
    [sales, today]
  );

  const monthSales = useMemo(() =>
    sales.filter((s) => s.createdAt.startsWith(currentMonth)),
    [sales, currentMonth]
  );

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const monthTotal = monthSales.reduce((sum, s) => sum + s.total, 0);
  const completedLists = schoolLists.filter((l) => l.status === 'completada').length;

  const lowStockProducts = products.filter((p) => p.active && p.stock <= p.minStock);
  const totalProducts = products.filter((p) => p.active).length;
  const totalStock = products.filter((p) => p.active).reduce((sum, p) => sum + p.stock, 0);

  const kpis = [
    {
      label: 'Ventas del día',
      value: `S/ ${todayTotal.toFixed(2)}`,
      sub: `${todaySales.length} transacciones`,
      icon: DollarSign,
      color: 'bg-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Ventas del mes',
      value: `S/ ${monthTotal.toFixed(2)}`,
      sub: `${monthSales.length} transacciones`,
      icon: TrendingUp,
      color: 'bg-success-600',
      bg: 'bg-success-50',
    },
    {
      label: 'Listas atendidas',
      value: completedLists.toString(),
      sub: `${schoolLists.length - completedLists} pendientes`,
      icon: ClipboardCheck,
      color: 'bg-accent-600',
      bg: 'bg-accent-50',
    },
    {
      label: 'Productos activos',
      value: totalProducts.toString(),
      sub: `${totalStock} unidades en stock`,
      icon: Package,
      color: 'bg-secondary-600',
      bg: 'bg-secondary-100',
    },
  ];

  // Sales by category
  const salesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          map[product.category] = (map[product.category] || 0) + item.price * item.quantity;
        }
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [sales, products]);

  const maxCategorySale = Math.max(...salesByCategory.map((c) => c[1]), 1);

  // Sales progress by worker
  const workerStats = useMemo(() => {
    const map: Record<string, { sales: number; revenue: number; items: number }> = {};
    sales.forEach((s) => {
      if (!map[s.cashier]) map[s.cashier] = { sales: 0, revenue: 0, items: 0 };
      map[s.cashier].sales += 1;
      map[s.cashier].revenue += s.total;
      map[s.cashier].items += s.items.reduce((sum, i) => sum + i.quantity, 0);
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [sales]);

  const maxWorkerRevenue = Math.max(...workerStats.map(([, s]) => s.revenue), 1);

  // Products per category
  const productsPerCategory = useMemo(() => {
    const map: Record<string, number> = {};
    products.filter((p) => p.active).forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [products]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Dashboard</h2>
        <p className="text-sm text-secondary-500 mt-1 flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color.replace('bg-', 'text-')}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-secondary-300" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">{kpi.value}</p>
            <p className="text-sm text-secondary-500 mt-1">{kpi.label}</p>
            <p className="text-xs text-secondary-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Category overview */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-secondary-900">Productos por categoría</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 bg-secondary-50 rounded-xl p-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                <CategoryIcon id={cat.id} className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary-900">{cat.name}</p>
                <p className="text-xs text-secondary-400">{productsPerCategory[cat.id] || 0} productos</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low stock alerts */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning-500" />
          <h3 className="font-semibold text-secondary-900">Alertas de inventario bajo</h3>
          <span className="ml-auto text-sm text-secondary-400">{lowStockProducts.length} productos</span>
        </div>
        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-secondary-400 py-4 text-center">No hay alertas de stock bajo</p>
        ) : (
          <div className="space-y-2">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-secondary-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon id={p.category} className="w-4 h-4 text-warning-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">{p.name}</p>
                  <p className="text-xs text-secondary-400">{getCategoryName(p.category)} › {getSubcategoryName(p.category, p.subcategory)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-sm font-bold ${p.stock === 0 ? 'text-danger-600' : 'text-warning-600'}`}>
                    {p.stock}
                  </span>
                  <span className="text-xs text-secondary-400"> / mín {p.minStock}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sales by category */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-secondary-900">Ventas por categoría</h3>
        </div>
        <div className="space-y-3">
          {salesByCategory.map(([catId, amount]) => {
            const cat = CATEGORIES.find((c) => c.id === catId);
            if (!cat) return null;
            return (
              <div key={catId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-sm text-secondary-700">
                    <CategoryIcon id={cat.id} className="w-4 h-4" />
                    {cat.name}
                  </span>
                  <span className="text-sm font-medium text-secondary-900">S/ {amount.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(amount / maxCategorySale) * 100}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales progress by worker */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-accent-600" />
          <h3 className="font-semibold text-secondary-900">Progreso de Ventas por Trabajador</h3>
        </div>
        <div className="space-y-4">
          {workerStats.map(([name, stats], idx) => {
            const isTop = idx === 0;
            const isBottom = idx === workerStats.length - 1 && workerStats.length > 1;
            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isTop ? 'bg-success-100 text-success-700' : isBottom ? 'bg-danger-100 text-danger-600' : 'bg-secondary-100 text-secondary-600'}`}>
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-secondary-900">{name}</span>
                    {isTop && (
                      <span className="text-[10px] font-bold text-success-700 bg-success-100 px-2 py-0.5 rounded-full">
                        TOP
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-secondary-900">S/ {stats.revenue.toFixed(2)}</span>
                    <span className="text-xs text-secondary-400 ml-2">{stats.sales} ventas · {stats.items} art.</span>
                  </div>
                </div>
                <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-success-500' : isBottom ? 'bg-danger-400' : 'bg-primary-500'}`}
                    style={{ width: `${(stats.revenue / maxWorkerRevenue) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
          {workerStats.length === 0 && (
            <p className="text-sm text-secondary-400 text-center py-4">No hay ventas registradas</p>
          )}
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <h3 className="font-semibold text-secondary-900 mb-4">Ventas recientes</h3>
        <div className="space-y-2">
          {sales.slice(-5).reverse().map((sale) => (
            <div key={sale.id} className="flex items-center gap-3 py-2 border-b border-secondary-50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-success-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {sale.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
                <p className="text-xs text-secondary-400">
                  {sale.cashier} • {new Date(sale.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-secondary-900">S/ {sale.total.toFixed(2)}</p>
                <p className="text-xs text-secondary-400">
                  {sale.paymentMethod === 'efectivo' ? 'Efectivo' : sale.paymentMethod === 'yape_plin' ? 'Yape/Plin' : 'Tarjeta'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
