import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../Modal';
import {
  Receipt, Search, Calendar, Clock, DollarSign,
  User, CreditCard, Banknote, Smartphone, ShoppingBag,
  TrendingUp, Award, ArrowDown, ArrowUp,
} from 'lucide-react';
import type { Sale } from '../../types';

const PAYMENT_LABELS: Record<string, { label: string; icon: typeof CreditCard }> = {
  efectivo: { label: 'Efectivo', icon: Banknote },
  yape_plin: { label: 'Yape/Plin', icon: Smartphone },
  tarjeta: { label: 'Tarjeta', icon: CreditCard },
};

type SortKey = 'date' | 'amount';

export function SalesTab() {
  const { sales, users } = useApp();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [filterCashier, setFilterCashier] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const cashiers = useMemo(() => {
    const names = new Set(sales.map((s) => s.cashier));
    return Array.from(names);
  }, [sales]);

  const filtered = useMemo(() => {
    let result = sales.filter((s) => {
      if (filterCashier !== 'all' && s.cashier !== filterCashier) return false;
      if (filterPayment !== 'all' && s.paymentMethod !== filterPayment) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.customerName.toLowerCase().includes(q) &&
          !s.cashier.toLowerCase().includes(q) &&
          !s.items.some((i) => i.name.toLowerCase().includes(q))
        ) return false;
      }
      return true;
    });
    result = [...result].sort((a, b) => {
      if (sortKey === 'amount') return b.total - a.total;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [sales, search, sortKey, filterCashier, filterPayment]);

  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
  const totalItems = filtered.reduce((sum, s) => sum + s.items.reduce((s2, i) => s2 + i.quantity, 0), 0);

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

  const maxRevenue = Math.max(...workerStats.map(([, s]) => s.revenue), 1);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  const activeWorkers = users.filter((u) => u.role === 'trabajador' && u.active);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Ventas Registradas</h2>
        <p className="text-sm text-secondary-500 mt-1">Historial detallado de todas las ventas y progreso por vendedor</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-primary-600" />
            <span className="text-xs text-secondary-500">Ventas</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-success-600" />
            <span className="text-xs text-secondary-500">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">S/ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-accent-600" />
            <span className="text-xs text-secondary-500">Artículos vendidos</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{totalItems}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-secondary-600" />
            <span className="text-xs text-secondary-500">Ticket promedio</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            S/ {filtered.length > 0 ? (totalRevenue / filtered.length).toFixed(2) : '0.00'}
          </p>
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
                    {isTop && <ArrowUp className="w-4 h-4 text-success-600" />}
                    {isBottom && !isTop && <ArrowDown className="w-4 h-4 text-danger-500" />}
                    <span className="text-sm font-medium text-secondary-900">{name}</span>
                    {isTop && (
                      <span className="text-[10px] font-bold text-success-700 bg-success-100 px-2 py-0.5 rounded-full">
                        TOP VENDEDOR
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
                    style={{ width: `${(stats.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
          {workerStats.length === 0 && (
            <p className="text-sm text-secondary-400 text-center py-4">No hay ventas registradas</p>
          )}
        </div>
        {activeWorkers.length > workerStats.length && (
          <div className="mt-4 pt-3 border-t border-secondary-100">
            <p className="text-xs text-secondary-400">
              Trabajadores sin ventas: {activeWorkers.filter((w) => !workerStats.some(([n]) => n === w.name)).map((w) => w.name).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-secondary-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
            placeholder="Buscar por comprador, vendedor o producto..."
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCashier('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCashier === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 border border-secondary-200'
            }`}
          >
            Todos los vendedores
          </button>
          {cashiers.map((name) => (
            <button
              key={name}
              onClick={() => setFilterCashier(name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCashier === name ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 border border-secondary-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterPayment('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterPayment === 'all' ? 'bg-secondary-700 text-white' : 'bg-white text-secondary-600 border border-secondary-200'
            }`}
          >
            Todos los pagos
          </button>
          {Object.entries(PAYMENT_LABELS).map(([id, { label }]) => (
            <button
              key={id}
              onClick={() => setFilterPayment(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterPayment === id ? 'bg-secondary-700 text-white' : 'bg-white text-secondary-600 border border-secondary-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSortKey('date')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortKey === 'date' ? 'bg-accent-600 text-white' : 'bg-white text-secondary-600 border border-secondary-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Por fecha
          </button>
          <button
            onClick={() => setSortKey('amount')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortKey === 'amount' ? 'bg-accent-600 text-white' : 'bg-white text-secondary-600 border border-secondary-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Por monto
          </button>
        </div>
      </div>

      {/* Sales list */}
      <div className="space-y-2">
        {filtered.map((sale) => {
          const pm = PAYMENT_LABELS[sale.paymentMethod] ?? PAYMENT_LABELS.efectivo;
          const PmIcon = pm.icon;
          return (
            <div
              key={sale.id}
              onClick={() => setSelectedSale(sale)}
              className="bg-white rounded-2xl p-4 card-shadow hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                    <PmIcon className="w-5 h-5 text-success-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-secondary-900 truncate">
                      {sale.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-secondary-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {sale.customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Receipt className="w-3 h-3" /> {sale.cashier}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-secondary-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(sale.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(sale.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <PmIcon className="w-3 h-3" /> {pm.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-secondary-900">S/ {sale.total.toFixed(2)}</p>
                  <p className="text-xs text-secondary-400">{sale.items.reduce((s, i) => s + i.quantity, 0)} artículos</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-secondary-400">
          <Receipt className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay ventas que coincidan con los filtros</p>
        </div>
      )}

      {/* Sale detail modal */}
      <Modal
        open={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        title="Detalle de Venta"
        maxWidth="max-w-lg"
      >
        {selectedSale && (
          <div className="space-y-4">
            <div className="bg-secondary-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-secondary-400" />
                <span className="text-sm text-secondary-500">Comprador:</span>
                <span className="text-sm font-semibold text-secondary-900">{selectedSale.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-secondary-400" />
                <span className="text-sm text-secondary-500">Vendedor:</span>
                <span className="text-sm font-semibold text-secondary-900">{selectedSale.cashier}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary-400" />
                <span className="text-sm text-secondary-500">Fecha:</span>
                <span className="text-sm font-semibold text-secondary-900">
                  {formatDate(selectedSale.createdAt)} · {formatTime(selectedSale.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const pm = PAYMENT_LABELS[selectedSale.paymentMethod] ?? PAYMENT_LABELS.efectivo;
                  const PmIcon = pm.icon;
                  return (
                    <>
                      <PmIcon className="w-4 h-4 text-secondary-400" />
                      <span className="text-sm text-secondary-500">Pago:</span>
                      <span className="text-sm font-semibold text-secondary-900">{pm.label}</span>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">Artículos</p>
              {selectedSale.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-secondary-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">{item.name}</p>
                    <p className="text-xs text-secondary-400">{item.quantity}x S/ {item.price.toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-semibold text-secondary-900">
                    S/ {(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
              <span className="text-sm text-secondary-500">
                {selectedSale.items.reduce((s, i) => s + i.quantity, 0)} artículos
              </span>
              <p className="text-lg font-bold text-secondary-900">Total: S/ {selectedSale.total.toFixed(2)}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
