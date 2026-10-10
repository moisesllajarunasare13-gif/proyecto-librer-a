import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardTab } from './admin/DashboardTab';
import { CatalogTab } from './admin/CatalogTab';
import { UsersTab } from './admin/UsersTab';
import { QuotesTab } from './admin/QuotesTab';
import { SalesTab } from './admin/SalesTab';
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  UsersRound,
  X,
} from 'lucide-react';
import type { AdminTab } from '../types';
import { Logo } from './Logo';

const NAV_ITEMS: { id: AdminTab; label: string; description: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Resumen general', icon: LayoutDashboard },
  { id: 'catalog', label: 'Inventario', description: 'Productos y stock', icon: Package },
  { id: 'sales', label: 'Ventas / POS', description: 'Operaciones de venta', icon: ShoppingCart },
  { id: 'users', label: 'Clientes', description: 'Personas y cuentas', icon: UsersRound },
  { id: 'quotes', label: 'Reportes', description: 'Cotizaciones y análisis', icon: BarChart3 },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Logo className={compact ? 'w-40' : 'w-48'} imageClassName="max-h-16" />;
}

export function AdminInterface() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setAppRole, authUser, logout } = useApp();

  const userInitials = (authUser?.name ?? 'A')
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const roleLabel = authUser?.role === 'admin' ? 'Administrador' : 'Trabajador';
  const currentItem = NAV_ITEMS.find((item) => item.id === activeTab) ?? NAV_ITEMS[0];

  const renderNavigation = (mobile = false) => (
    <nav className="space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (mobile) setSidebarOpen(false);
            }}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-sky-400/20 to-primary-600/20 text-white ring-1 ring-sky-300/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-sky-400 text-primary-950' : 'bg-white/5 text-slate-400 group-hover:text-sky-300'}`}>
              <item.icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className={`mt-0.5 block text-[11px] ${isActive ? 'text-sky-200/80' : 'text-slate-500'}`}>{item.description}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );

  const renderAccount = () => (
    <div className="border-t border-white/10 pt-4">
      <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-primary-700">
          {userInitials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{authUser?.name ?? 'Usuario'}</p>
          <p className="text-xs text-slate-400">{roleLabel}</p>
        </div>
      </div>
      <button
        onClick={() => setAppRole('mobile')}
        className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LayoutDashboard className="h-4 w-4" /> Vista móvil
      </button>
      <button
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-72 shrink-0 flex-col bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 px-4 py-5 lg:flex">
        <div className="border-b border-white/10 px-3 pb-6">
          <BrandMark />
          <p className="mt-5 max-w-[190px] text-xs leading-5 text-slate-400">Gestión simple para una librería que inspira.</p>
        </div>
        <div className="flex-1 px-1 py-6">{renderNavigation()}</div>
        {renderAccount()}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Cerrar menú" className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-[min(86vw,18rem)] flex-col bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 px-4 py-5 shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-white/10 px-2 pb-5">
              <BrandMark compact />
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Cerrar menú">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 px-1 py-6">{renderNavigation(true)}</div>
            {renderAccount()}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <Logo className="hidden w-32 p-1 sm:block" imageClassName="max-h-7" />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-500">Panel de gestión</p>
                <h1 className="mt-1 text-xl font-bold text-slate-900">{currentItem.label}</h1>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{authUser?.name ?? 'Usuario'}</p>
              <p className="text-xs text-slate-400">{roleLabel}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-primary-700">{userInitials}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'sales' && <SalesTab />}
          {activeTab === 'catalog' && <CatalogTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'quotes' && <QuotesTab />}
        </main>
      </div>
    </div>
  );
}
