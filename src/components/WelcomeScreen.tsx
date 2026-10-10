import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';

interface WelcomeScreenProps {
  onFinish: () => void;
  duration?: number;
}

export function WelcomeScreen({ onFinish, duration = 5000 }: WelcomeScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), duration - 600);
    const doneTimer = setTimeout(onFinish, duration);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-900 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-white blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative animate-scale-in">
        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center ring-1 ring-white/20 shadow-2xl">
          <Store className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* App name */}
      <h1 className="text-3xl font-bold text-white mt-6 animate-fade-in tracking-tight">
        PapeleraApp
      </h1>
      <p className="text-sm text-primary-200 mt-2 animate-fade-in">
        Gestión de papelería y tienda escolar
      </p>

      {/* Loading animation */}
      <div className="mt-10 flex flex-col items-center gap-3 animate-fade-in">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="w-40 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/70"
            style={{
              animation: `welcomeProgress ${duration}ms ease-in-out forwards`,
            }}
          />
        </div>
        <p className="text-xs text-primary-200/70">Cargando...</p>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-primary-300/50">
        PapeleraApp © 2026
      </p>

      <style>{`
        @keyframes welcomeProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
