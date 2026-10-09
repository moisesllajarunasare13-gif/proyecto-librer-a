import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../Modal';
import {
  Palette, Phone, Calendar, DollarSign,
  CircleDot, Loader, CheckCircle2, StickyNote,
  Plus, X,
} from 'lucide-react';
import type { ServiceStatus, ServiceOrder } from '../../types';

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string; icon: typeof CircleDot }> = {
  recibido: { label: 'Recibido', color: 'text-warning-600', bg: 'bg-warning-100', icon: CircleDot },
  en_proceso: { label: 'En proceso', color: 'text-primary-600', bg: 'bg-primary-100', icon: Loader },
  listo: { label: 'Listo', color: 'text-success-600', bg: 'bg-success-100', icon: CheckCircle2 },
};

const STATUS_ORDER: ServiceStatus[] = ['recibido', 'en_proceso', 'listo'];

const EMPTY_FORM = {
  title: '',
  customerName: '',
  phone: '',
  description: '',
  notes: '',
  estimatedPrice: '',
  dueDate: '',
};

export function ServicesTab() {
  const { services, setServices, showToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleStatusChange = (id: string, newStatus: ServiceStatus) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    showToast(`Estado actualizado a: ${STATUS_CONFIG[newStatus].label}`, 'success');
  };

  const updateField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    form.title.trim() !== '' &&
    form.customerName.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.dueDate.trim() !== '';

  const handleSubmit = () => {
    if (!isFormValid) {
      showToast('Completa los campos obligatorios', 'error');
      return;
    }
    const newOrder: ServiceOrder = {
      id: 'svc' + Date.now(),
      title: form.title.trim(),
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      description: form.description.trim() || 'Sin descripción',
      notes: form.notes.trim() || 'Sin notas adicionales',
      estimatedPrice: form.estimatedPrice ? parseFloat(form.estimatedPrice) : 0,
      status: 'recibido',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: form.dueDate.trim(),
    };
    setServices((prev) => [newOrder, ...prev]);
    showToast(`Encargo "${newOrder.title}" registrado`, 'success');
    setForm(EMPTY_FORM);
    setModalOpen(false);
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setModalOpen(false);
  };

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-secondary-900">Servicios y Manualidades</h2>
        <p className="text-sm text-secondary-500 mt-1">Encargos especiales y trabajos</p>
      </div>

      {/* Add new encargo button */}
      <button
        onClick={() => setModalOpen(true)}
        className="w-full bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white rounded-2xl py-3.5 transition-all flex items-center justify-center gap-2 font-bold text-sm mb-4"
      >
        <Plus className="w-5 h-5" /> Agregar Nuevo Encargo
      </button>

      <div className="space-y-3">
        {services.map((service) => {
          const config = STATUS_CONFIG[service.status];
          const StatusIcon = config.icon;
          return (
            <div key={service.id} className="bg-white rounded-2xl p-4 card-shadow space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5 text-accent-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-secondary-900">{service.title}</p>
                  <p className="text-sm text-secondary-500">{service.customerName}</p>
                </div>
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} flex-shrink-0`}>
                  <StatusIcon className="w-3.5 h-3.5" /> {config.label}
                </span>
              </div>

              {/* Description */}
              <div className="bg-secondary-50 rounded-xl p-3">
                <p className="text-xs text-secondary-600 leading-relaxed">{service.description}</p>
              </div>

              {/* Client notes */}
              <div className="bg-accent-50 border border-accent-100 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <StickyNote className="w-3.5 h-3.5 text-accent-600" />
                  <span className="text-xs font-semibold text-accent-700">Notas del cliente</span>
                </div>
                <p className="text-xs text-secondary-600 leading-relaxed">{service.notes}</p>
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-xs text-secondary-500">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {service.phone}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {service.dueDate}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> S/ {service.estimatedPrice.toFixed(2)}</span>
              </div>

              {/* Status buttons */}
              <div className="flex gap-2 pt-1">
                {STATUS_ORDER.map((status) => {
                  const sc = STATUS_CONFIG[status];
                  const SIcon = sc.icon;
                  const isActive = service.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(service.id, status)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                        isActive
                          ? `${sc.bg} ${sc.color} ring-1 ring-current`
                          : 'bg-secondary-50 text-secondary-400 hover:bg-secondary-100'
                      }`}
                    >
                      <SIcon className="w-3.5 h-3.5" /> {sc.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-secondary-400">
          <Palette className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay encargos registrados</p>
          <p className="text-xs mt-1">Toca "Agregar Nuevo Encargo" para crear uno</p>
        </div>
      )}

      {/* New encargo modal */}
      <Modal open={modalOpen} onClose={handleClose} title="Nuevo Encargo" maxWidth="max-w-md">
        <div className="space-y-4">
          <FormField label="Título del encargo" required>
            <input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              placeholder="Ej: Forrar 5 cuadernos"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Cliente" required>
              <input
                value={form.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
                placeholder="Nombre"
              />
            </FormField>
            <FormField label="Teléfono" required>
              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
                placeholder="999 999 999"
              />
            </FormField>
          </div>

          <FormField label="Descripción del trabajo">
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all resize-none"
              placeholder="Detalles del encargo..."
            />
          </FormField>

          <FormField label="Notas del cliente">
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all resize-none"
              placeholder="Preferencias, colores, indicaciones..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Precio estimado (S/)">
              <input
                type="number"
                min="0"
                step="0.50"
                value={form.estimatedPrice}
                onChange={(e) => updateField('estimatedPrice', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Fecha de entrega" required>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              />
            </FormField>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-1.5 bg-secondary-100 hover:bg-secondary-200 active:scale-95 text-secondary-700 rounded-xl py-3 transition-all text-sm font-medium"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl py-3 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Registrar Encargo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
