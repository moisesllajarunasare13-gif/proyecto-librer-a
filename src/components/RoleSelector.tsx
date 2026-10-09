import { useApp } from '../context/AppContext';
import { Smartphone, Monitor } from 'lucide-react';

export function RoleSelector() {
  const { appRole, setAppRole } = useApp();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] lg:bottom-6">
      <div className="bg-white rounded-full shadow-lg border border-secondary-200 p-1 flex items-center gap-1">
        <button
          onClick={() => setAppRole('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            appRole === 'mobile'
              ? 'bg-primary-600 text-white'
              : 'text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Vista Móvil</span>
        </button>
        <button
          onClick={() => setAppRole('admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            appRole === 'admin'
              ? 'bg-primary-600 text-white'
              : 'text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Panel Admin</span>
        </button>
      </div>
    </div>
  );
}
