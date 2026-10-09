import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardTab } from './admin/DashboardTab';
import { CatalogTab } from './admin/CatalogTab';
import { UsersTab } from './admin/UsersTab';
import { QuotesTab } from './admin/QuotesTab';
import { SalesTab } from './admin/SalesTab';
import {
  LayoutDashboard, Package, Users, FileText, Receipt,
  Menu, X, LogOut,
} from 'lucide-react';
import type { AdminTab } from '../types';

const NAV_ITEMS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Ventas', icon: Receipt },
  { id: 'catalog', label: 'Catálogo de Productos', icon: Package },
  { id: 'users', label: 'Usuarios y Roles', icon: Users },
  { id: 'quotes', label: 'Cotizaciones y Faltantes', icon: FileText },
];

export function AdminInterface() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setAppRole, authUser, logout } = useApp();

  const userInitials = (authUser?.name ?? 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const roleLabel = authUser?.role === 'admin' ? 'Administrador' : 'Trabajador';

  const currentLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? '';

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 bg-secondary-900 flex-col flex-shrink-0">
        <div className="px-6 py-5 flex items-center gap-2.5 border-b border-secondary-800">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">PapeleraApp</p>
            <p className="text-secondary-400 text-[10px]">Panel Administrativo</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-400 hover:bg-secondary-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-secondary-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-sm">{userInitials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{authUser?.name ?? 'Usuario'}</p>
              <p className="text-secondary-400 text-xs">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={() => setAppRole('mobile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-400 hover:bg-secondary-800 hover:text-white transition-all mb-1"
          >
            <LogOut className="w-5 h-5" /> Cambiar a vista móvil
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger-400 hover:bg-danger-950/30 hover:text-danger-400 transition-all"
          >
            <LogOut className="w-5 h-5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Sidebar - mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-secondary-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-secondary-900 flex flex-col animate-slide-in-right">
            <div className="px-6 py-5 flex items-center justify-between border-b border-secondary-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">PapeleraApp</p>
                  <p className="text-secondary-400 text-[10px]">Panel Admin</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-secondary-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id ? 'bg-primary-600 text-white' : 'text-secondary-400 hover:bg-secondary-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-secondary-800">
              <button
                onClick={() => setAppRole('mobile')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-400 hover:bg-secondary-800 hover:text-white transition-all mb-1"
              >
                <LogOut className="w-5 h-5" /> Vista móvil
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger-400 hover:bg-danger-950/30 transition-all"
              >
                <LogOut className="w-5 h-5" /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-secondary-100 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-secondary-600">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-secondary-900">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-secondary-500">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">{userInitials}</span>
              </div>
              <span className="font-medium text-secondary-700">{authUser?.name ?? 'Usuario'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'sales' && <SalesTab />}
          {activeTab === 'catalog' && <CatalogTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'quotes' && <QuotesTab />}
        </div>
      </div>
    </div>
  );
}
