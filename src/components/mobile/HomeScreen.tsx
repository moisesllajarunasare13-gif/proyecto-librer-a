import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../CategoryIcon';
import { Logo } from '../Logo';
import {
  ScanLine, ShoppingCart, ClipboardList, Palette,
  ArrowLeft, LogOut, TrendingUp, Clock, Wrench,
} from 'lucide-react';
import type { MobileTab } from '../../types';

interface ModuleCard {
  id: MobileTab;
  title: string;
  description: string;
  icon: typeof ScanLine;
  color: string;
  bg: string;
  ring: string;
}

const MODULES: ModuleCard[] = [
  {
    id: 'scanner',
    title: 'Escanear Inventario',
    description: 'Registra productos con código de barras',
    icon: ScanLine,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    ring: 'ring-primary-100',
  },
  {
    id: 'counter',
    title: 'Venta Mostrador',
    description: 'Cobra productos y finaliza pedidos',
    icon: ShoppingCart,
    color: 'text-success-600',
    bg: 'bg-success-50',
    ring: 'ring-success-100',
  },
  {
    id: 'picking',
    title: 'Cotización de Lista Escolar',
    description: 'Atiende listas escolares de los clientes',
    icon: ClipboardList,
    color: 'text-accent-600',
    bg: 'bg-accent-50',
    ring: 'ring-accent-100',
  },
  {
    id: 'services',
    title: 'Servicios Personalizados',
    description: 'Gestiona pedidos de maquetas, disfraces y más',
    icon: Palette,
    color: 'text-warning-600',
    bg: 'bg-warning-50',
    ring: 'ring-warning-100',
  },
];

interface HomeScreenProps {
  onEnterModule: (tab: MobileTab) => void;
}

export function HomeScreen({ onEnterModule }: HomeScreenProps) {
  const { authUser, logout, cartCount, sales, schoolLists, services } = useApp();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const firstName = authUser?.name?.split(' ')[0] ?? 'Trabajador';
  const todayLabel = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.createdAt.startsWith(today));
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const pendingLists = schoolLists.filter((l) => l.status === 'pendiente' || l.status === 'en_proceso').length;
  const activeServices = services.filter((s) => s.status === 'recibido' || s.status === 'en_proceso').length;

  const quickStats = [
    { label: 'Ventas hoy', value: `S/ ${todayTotal.toFixed(0)}`, icon: TrendingUp, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Listas', value: pendingLists.toString(), icon: Clock, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Servicios', value: activeServices.toString(), icon: Wrench, color: 'text-warning-600', bg: 'bg-warning-50' },
  ];

  return (
    <div className="flex flex-col min-h-full bg-secondary-50">
      {/* Header with greeting */}
      <div className="bg-white px-5 pt-8 pb-6 rounded-b-3xl card-shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Logo className="w-32 p-1" imageClassName="max-h-8" />
          <button
            onClick={logout}
            className="w-9 h-9 rounded-xl text-secondary-400 hover:text-danger-600 hover:bg-danger-50 flex items-center justify-center transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div>
          <p className="text-xs font-medium text-secondary-400 uppercase tracking-wide capitalize mb-1">
            {todayLabel}
          </p>
          <h1 className="text-2xl font-bold text-secondary-900 leading-tight">
            {greeting},
          </h1>
          <h1 className="text-2xl font-bold text-primary-600 leading-tight">
            {firstName}
          </h1>
          <p className="text-sm text-secondary-400 mt-1.5">¿Qué vas a hacer hoy?</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`rounded-xl ${stat.bg} py-2.5 px-2 text-center`}>
                <Icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-secondary-400 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modules */}
      <div className="flex-1 px-5 py-6">
        <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wide mb-3">
          Módulos
        </p>
        <div className="space-y-3">
          {MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            const badge = mod.id === 'counter' && cartCount > 0 ? cartCount : null;
            return (
              <button
                key={mod.id}
                onClick={() => onEnterModule(mod.id)}
                className="w-full bg-white rounded-2xl p-4 card-shadow hover:card-shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-left group animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${mod.bg} flex items-center justify-center flex-shrink-0 ring-1 ${mod.ring} relative`}>
                    <Icon className={`w-6 h-6 ${mod.color} transition-transform group-hover:scale-110`} />
                    {badge !== null && (
                      <span className="absolute -top-1.5 -right-1.5 bg-danger-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-secondary-900">{mod.title}</p>
                    <p className="text-xs text-secondary-400 mt-0.5">{mod.description}</p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-secondary-300 rotate-180 group-hover:text-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-secondary-300">
          <CategoryIcon id="escolar" className="w-3.5 h-3.5" />
          <span>ANDITSA Librería © 2026</span>
        </div>
      </div>
    </div>
  );
}
