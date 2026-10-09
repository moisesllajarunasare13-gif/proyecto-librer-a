import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../Modal';
import {
  FileText, Search, Calendar, School, AlertTriangle,
  Check, X, Plus, Trash2, DollarSign,
} from 'lucide-react';
import type { Quote, QuoteItem } from '../../types';

export function QuotesTab() {
  const { quotes, setQuotes, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newItems, setNewItems] = useState<QuoteItem[]>([{ name: '', quantity: 1, unitPrice: 0, available: true }]);

  const filtered = useMemo(() =>
    quotes.filter((q) =>
      !search || q.customerName.toLowerCase().includes(search.toLowerCase()) || q.school.toLowerCase().includes(search.toLowerCase())
    ), [quotes, search]);

  const totalQuotes = quotes.reduce((sum, q) => sum + q.total, 0);
  const totalMissing = quotes.reduce((sum, q) => sum + q.missingCount, 0);

  const handleAddItem = () => {
    setNewItems([...newItems, { name: '', quantity: 1, unitPrice: 0, available: true }]);
  };

  const handleRemoveItem = (idx: number) => {
    setNewItems(newItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof QuoteItem, value: string | number | boolean) => {
    setNewItems(newItems.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleCreateQuote = () => {
    if (!newCustomer || newItems.length === 0) {
      showToast('Completa los datos del cliente', 'error');
      return;
    }
    const total = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const missingCount = newItems.filter((i) => !i.available).length;
    const quote: Quote = {
      id: 'q' + Date.now(),
      customerName: newCustomer,
      school: newSchool,
      grade: newGrade,
      items: newItems.filter((i) => i.name),
      total,
      missingCount,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuotes((prev) => [...prev, quote]);
    setCreateOpen(false);
    setNewCustomer('');
    setNewSchool('');
    setNewGrade('');
    setNewItems([{ name: '', quantity: 1, unitPrice: 0, available: true }]);
    showToast('Cotización creada', 'success');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Cotizaciones y Faltantes</h2>
          <p className="text-sm text-secondary-500 mt-1">Presupuestos de listas escolares e ítems faltantes</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Nueva Cotización
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary-600" />
            <span className="text-xs text-secondary-500">Cotizaciones</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{quotes.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-success-600" />
            <span className="text-xs text-secondary-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">S/ {totalQuotes.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning-500" />
            <span className="text-xs text-secondary-500">Faltantes</span>
          </div>
          <p className="text-2xl font-bold text-warning-600">{totalMissing}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-secondary-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
          placeholder="Buscar por cliente o colegio..."
        />
      </div>

      {/* Quotes list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((quote) => (
          <div
            key={quote.id}
            onClick={() => setSelectedQuote(quote)}
            className="bg-white rounded-2xl p-5 card-shadow hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-secondary-900">{quote.customerName}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-secondary-500">
                  <span className="flex items-center gap-1"><School className="w-3 h-3" /> {quote.school}</span>
                  <span>•</span>
                  <span>{quote.grade}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-secondary-900">S/ {quote.total.toFixed(2)}</p>
                <p className="text-xs text-secondary-400 flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3" /> {quote.createdAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-600 font-medium">
                {quote.items.length} items
              </span>
              {quote.missingCount > 0 ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-100 text-warning-600 font-medium">
                  <AlertTriangle className="w-3 h-3" /> {quote.missingCount} faltantes
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-100 text-success-600 font-medium">
                  <Check className="w-3 h-3" /> Completo
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-secondary-400">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay cotizaciones registradas</p>
        </div>
      )}

      {/* Quote detail modal */}
      <Modal
        open={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        title="Detalle de Cotización"
        maxWidth="max-w-lg"
      >
        {selectedQuote && (
          <div className="space-y-4">
            <div className="bg-secondary-50 rounded-xl p-4">
              <p className="font-semibold text-secondary-900">{selectedQuote.customerName}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-secondary-500">
                <span className="flex items-center gap-1"><School className="w-3.5 h-3.5" /> {selectedQuote.school}</span>
                <span>•</span>
                <span>{selectedQuote.grade}</span>
              </div>
            </div>
            <div className="space-y-2">
              {selectedQuote.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-secondary-50 last:border-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.available ? 'bg-success-100' : 'bg-warning-100'}`}>
                    {item.available ? <Check className="w-3.5 h-3.5 text-success-600" /> : <X className="w-3.5 h-3.5 text-warning-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">{item.name}</p>
                    <p className="text-xs text-secondary-400">{item.quantity}x S/ {item.unitPrice.toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-semibold text-secondary-900">S/ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
              <div>
                {selectedQuote.missingCount > 0 && (
                  <p className="text-xs text-warning-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {selectedQuote.missingCount} ítems sin stock
                  </p>
                )}
              </div>
              <p className="text-lg font-bold text-secondary-900">Total: S/ {selectedQuote.total.toFixed(2)}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create quote modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva Cotización" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-secondary-500 mb-1.5 block">Cliente</label>
              <input
                value={newCustomer}
                onChange={(e) => setNewCustomer(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 outline-none text-sm transition-all"
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary-500 mb-1.5 block">Colegio</label>
              <input
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 outline-none text-sm transition-all"
                placeholder="Colegio"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary-500 mb-1.5 block">Grado</label>
              <input
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 outline-none text-sm transition-all"
                placeholder="Grado"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-secondary-500">Ítems</label>
              <button onClick={handleAddItem} className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {newItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-2 rounded-lg border border-secondary-200 text-sm outline-none focus:border-primary-500"
                    placeholder="Producto"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-16 px-2.5 py-2 rounded-lg border border-secondary-200 text-sm outline-none focus:border-primary-500"
                    placeholder="Cant"
                  />
                  <input
                    type="number"
                    step="0.10"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2.5 py-2 rounded-lg border border-secondary-200 text-sm outline-none focus:border-primary-500"
                    placeholder="Precio"
                  />
                  <button
                    onClick={() => handleItemChange(idx, 'available', !item.available)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${item.available ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'}`}
                  >
                    {item.available ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </button>
                  {newItems.length > 1 && (
                    <button onClick={() => handleRemoveItem(idx)} className="text-secondary-400 hover:text-danger-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateQuote}
            className="w-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl py-3 font-semibold transition-all"
          >
            Crear Cotización
          </button>
        </div>
      </Modal>
    </div>
  );
}
