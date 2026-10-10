import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Decorative gold accents */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-accent-500 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-accent-500 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent-400 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative animate-scale-in">
        <div className="w-24 h-24 rounded-3xl bg-accent-500/10 backdrop-blur-md flex items-center justify-center ring-1 ring-accent-500/30 shadow-2xl">
          <BookOpen className="w-12 h-12 text-accent-400" />
        </div>
        <div className="absolute -inset-2 rounded-3xl ring-1 ring-accent-500/10" />
      </div>

      {/* App name */}
      <h1 className="font-heading text-4xl font-bold text-white mt-6 animate-fade-in tracking-tight text-center">
        Librería Anditsa
      </h1>
      <p className="text-sm text-accent-300 mt-2 animate-fade-in tracking-wide">
        Tu librería de confianza
      </p>

      {/* Loading animation */}
      <div className="mt-10 flex flex-col items-center gap-3 animate-fade-in">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="w-44 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600"
            style={{
              animation: `welcomeProgress ${duration}ms ease-in-out forwards`,
            }}
          />
        </div>
        <p className="text-xs text-accent-300/70">Cargando...</p>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-white/30">
        Librería Anditsa © 2026
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
