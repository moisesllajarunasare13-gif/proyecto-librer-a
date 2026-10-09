import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg animate-slide-in-right ${
            toast.type === 'success'
              ? 'bg-success-600 text-white'
              : toast.type === 'error'
              ? 'bg-danger-600 text-white'
              : 'bg-primary-600 text-white'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
