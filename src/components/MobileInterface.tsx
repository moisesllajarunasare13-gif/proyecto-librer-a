import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScannerTab } from './mobile/ScannerTab';
import { CounterTab } from './mobile/CounterTab';
import { PickingTab } from './mobile/PickingTab';
import { ServicesTab } from './mobile/ServicesTab';
import { HomeScreen } from './mobile/HomeScreen';
import { ScanLine, ShoppingCart, ClipboardList, Palette, Home, ArrowLeft, LogOut } from 'lucide-react';
import type { MobileTab } from '../types';

type View = MobileTab | 'home';

const MODULE_LABELS: Record<MobileTab, string> = {
  scanner: 'Escanear Inventario',
  counter: 'Venta Mostrador',
  picking: 'Cotización de Lista Escolar',
  services: 'Servicios',
};

export function MobileInterface() {
  const [activeView, setActiveView] = useState<View>('home');
  const { cartCount, authUser, logout } = useApp();

  const goHome = () => setActiveView('home');
  const enterModule = (tab: MobileTab) => setActiveView(tab);
  const isHome = activeView === 'home';

  return (
    <div className="flex flex-col h-screen bg-secondary-50 max-w-md mx-auto">
      {/* Header — hidden on home (home has its own header) */}
      {!isHome && (
        <div className="bg-white px-4 py-3 border-b border-secondary-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={goHome}
              className="w-9 h-9 rounded-xl text-secondary-500 hover:bg-secondary-100 flex items-center justify-center transition-colors active:scale-90"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm font-bold text-secondary-900 leading-none">{MODULE_LABELS[activeView as MobileTab]}</p>
              <p className="text-[10px] text-secondary-400 mt-0.5">{authUser?.name ?? 'Trabajador'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-secondary-400 hidden sm:inline">
              {new Date().toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg text-secondary-400 hover:text-danger-600 hover:bg-danger-50 flex items-center justify-center transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isHome && <HomeScreen onEnterModule={enterModule} />}
        {activeView === 'scanner' && <ScannerTab />}
        {activeView === 'counter' && <CounterTab />}
        {activeView === 'picking' && <PickingTab />}
        {activeView === 'services' && <ServicesTab />}
      </div>

      {/* Bottom Navigation — always visible */}
      <nav className="bg-white border-t border-secondary-100 flex-shrink-0">
        <div className="flex">
          <NavButton
            label="Inicio"
            active={isHome}
            onClick={goHome}
            icon={<Home className="w-5 h-5" />}
          />
          <NavButton
            label="Escáner"
            active={activeView === 'scanner'}
            onClick={() => setActiveView('scanner')}
            icon={<ScanLine className="w-5 h-5" />}
          />
          <NavButton
            label="Mostrador"
            active={activeView === 'counter'}
            onClick={() => setActiveView('counter')}
            icon={
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-danger-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
              </div>
            }
          />
          <NavButton
            label="Listas"
            active={activeView === 'picking'}
            onClick={() => setActiveView('picking')}
            icon={<ClipboardList className="w-5 h-5" />}
          />
          <NavButton
            label="Servicios"
            active={activeView === 'services'}
            onClick={() => setActiveView('services')}
            icon={<Palette className="w-5 h-5" />}
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({
  label, active, onClick, icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all relative ${
        active ? 'text-primary-600' : 'text-secondary-400'
      }`}
    >
      {active && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full" />
      )}
      <div className={`transition-transform ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
