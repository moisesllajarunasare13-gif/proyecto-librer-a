import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Lock, Mail, LogIn, BookOpen } from 'lucide-react';

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
        showToast('Bienvenido a Librería Anditsa', 'success');
      } else {
        showToast('Email o contraseña incorrectos', 'error');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/10 backdrop-blur-md flex items-center justify-center mx-auto mb-4 ring-1 ring-accent-500/30">
            <BookOpen className="w-8 h-8 text-accent-400" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">Librería Anditsa</h1>
          <p className="text-sm text-accent-300 mt-1">Tu librería de confianza</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl p-6 card-shadow-lg animate-slide-up">
          <div className="flex items-center gap-2 mb-5">
            <LogIn className="w-5 h-5 text-accent-600" />
            <h2 className="text-lg font-semibold text-secondary-900">Iniciar sesión</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none text-sm transition-all"
                placeholder="usuario@anditsa.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-secondary-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none text-sm transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 active:scale-95 disabled:opacity-60 text-white rounded-xl py-3 font-semibold transition-all"
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

        <p className="text-center text-xs text-accent-300/70 mt-6">
          Librería Anditsa © 2026 — Sistema de gestión integral
        </p>
      </div>
    </div>
  );
}
