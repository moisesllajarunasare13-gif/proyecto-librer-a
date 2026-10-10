import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import { Logo } from './Logo';

export function LoginScreen() {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Ingresa email y contraseña', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      setLoading(false);
      if (ok) {
        showToast('Bienvenido a ANDITSA Librería', 'success');
      } else {
        showToast('Email o contraseña incorrectos', 'error');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-900 to-primary-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-brand-blue/15 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-brand-sky/10 blur-3xl" />
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Logo className="mx-auto w-60" imageClassName="max-h-28" />
          <p className="text-sm text-primary-200 mt-4 tracking-wide">Tu librería de confianza</p>
        </div>

        {/* Login card */}
        <div className="rounded-3xl border border-white/15 bg-white/[0.09] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl animate-slide-up sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/20 ring-1 ring-brand-sky/25">
              <LogIn className="h-5 w-5 text-brand-sky" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Iniciar sesión</h2>
              <p className="mt-0.5 text-xs text-primary-200/75">Accede a tu panel de gestión</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary-100/85">
                <Mail className="w-3.5 h-3.5" /> Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-primary-100/40 focus:border-brand-sky/70 focus:bg-white/[0.12] focus:ring-4 focus:ring-brand-blue/20"
                placeholder="usuario@anditsa.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary-100/85">
                <Lock className="w-3.5 h-3.5" /> Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3 pr-11 text-sm text-white outline-none transition-all placeholder:text-primary-100/40 focus:border-brand-sky/70 focus:bg-white/[0.12] focus:ring-4 focus:ring-brand-blue/20"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-primary-200/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue to-primary-600 py-3.5 font-semibold text-white shadow-lg shadow-brand-blue/20 transition-all hover:from-primary-500 hover:to-primary-700 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Ingresar
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-7 text-center text-xs text-primary-200/65">
          ANDITSA Librería © 2026 — Sistema de gestión integral
        </p>
      </div>
    </div>
  );
}
