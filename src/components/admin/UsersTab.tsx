import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../Modal';
import {
  Shield, User as UserIcon, Plus, Mail, Lock,
  Check, X, Search, Crown, Package,
} from 'lucide-react';
import type { User, UserRole } from '../../types';

export function UsersTab() {
  const { users, setUsers, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('trabajador');

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    const user = users.find((u) => u.id === id);
    showToast(user?.active ? 'Usuario desactivado' : 'Usuario activado', user?.active ? 'info' : 'success');
  };

  const changeRole = (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    showToast('Rol actualizado a ' + (role === 'admin' ? 'Administrador' : 'Trabajador de Tienda'), 'success');
  };

  const handleAdd = () => {
    if (!newName || !newEmail) {
      showToast('Completa nombre y email', 'error');
      return;
    }
    const newUser: User = {
      id: 'u' + Date.now(),
      name: newName,
      email: newEmail,
      role: newRole,
      active: true,
      lastLogin: '—',
    };
    setUsers((prev) => [...prev, newUser]);
    setAddOpen(false);
    setNewName('');
    setNewEmail('');
    setNewRole('trabajador');
    showToast('Usuario creado: ' + newUser.name, 'success');
  };

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const workerCount = users.filter((u) => u.role === 'trabajador').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Usuarios y Roles</h2>
          <p className="text-sm text-secondary-500 mt-1">Gestión de personal y control de accesos</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-sm text-secondary-500">Administradores</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{adminCount}</p>
          <p className="text-xs text-secondary-400 mt-1">Acceso completo al panel</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-success-600" />
            </div>
            <span className="text-sm text-secondary-500">Trabajadores</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{workerCount}</p>
          <p className="text-xs text-secondary-400 mt-1">Acceso a interfaz móvil</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-secondary-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
          placeholder="Buscar usuario por nombre o email..."
        />
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3 hidden sm:table-cell">Último acceso</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-secondary-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${user.role === 'admin' ? 'bg-primary-100' : 'bg-success-100'}`}>
                        {user.role === 'admin' ? <Crown className="w-4 h-4 text-primary-600" /> : <UserIcon className="w-4 h-4 text-success-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-secondary-900 truncate">{user.name}</p>
                        <p className="text-xs text-secondary-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-secondary-500">{user.lastLogin}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                      className="text-xs border border-secondary-200 rounded-lg px-2 py-1.5 bg-white focus:border-primary-500 outline-none cursor-pointer"
                    >
                      <option value="admin">Administrador</option>
                      <option value="trabajador">Trabajador</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {user.active ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-success-600">
                        <span className="w-2 h-2 rounded-full bg-success-500" /> Activo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-secondary-400">
                        <span className="w-2 h-2 rounded-full bg-secondary-400" /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActive(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        user.active
                          ? 'text-danger-600 hover:bg-danger-50'
                          : 'text-success-600 hover:bg-success-50'
                      }`}
                    >
                      {user.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC permission matrix */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-secondary-900">Matriz de permisos (RBAC)</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-secondary-500 border-b border-secondary-100">
                <th className="py-2 pr-4">Permiso</th>
                <th className="py-2 px-3 text-center">Administrador</th>
                <th className="py-2 px-3 text-center">Trabajador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {[
                { perm: 'Ver dashboard y KPIs', admin: true, worker: false },
                { perm: 'Gestionar catálogo de productos', admin: true, worker: false },
                { perm: 'Carga masiva de productos', admin: true, worker: false },
                { perm: 'Gestionar usuarios y roles', admin: true, worker: false },
                { perm: 'Ver cotizaciones y faltantes', admin: true, worker: false },
                { perm: 'Escanear y dar alta productos', admin: true, worker: true },
                { perm: 'Cobrar / finalizar ventas', admin: true, worker: true },
                { perm: 'Recolectar listas escolares', admin: true, worker: true },
                { perm: 'Gestionar servicios y manualidades', admin: true, worker: true },
              ].map((row) => (
                <tr key={row.perm}>
                  <td className="py-2.5 pr-4 text-secondary-700">{row.perm}</td>
                  <td className="py-2.5 px-3 text-center">
                    {row.admin ? <Check className="w-4 h-4 text-success-600 inline" /> : <X className="w-4 h-4 text-secondary-300 inline" />}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.worker ? <Check className="w-4 h-4 text-success-600 inline" /> : <X className="w-4 h-4 text-secondary-300 inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add user modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Nuevo Usuario">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" /> Nombre completo
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              placeholder="Ej. Pedro Salazar"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
              placeholder="usuario@papelerapp.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Contraseña inicial
            </label>
            <input
              type="password"
              defaultValue="temporal123"
              className="w-full px-3 py-2.5 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
            />
            <p className="text-xs text-secondary-400 mt-1">Se solicitará cambio en primer acceso</p>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Rol
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setNewRole('admin')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm transition-all ${
                  newRole === 'admin' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200 text-secondary-600'
                }`}
              >
                <Crown className="w-4 h-4" /> Administrador
              </button>
              <button
                onClick={() => setNewRole('trabajador')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm transition-all ${
                  newRole === 'trabajador' ? 'border-success-500 bg-success-50 text-success-700' : 'border-secondary-200 text-secondary-600'
                }`}
              >
                <Package className="w-4 h-4" /> Trabajador
              </button>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl py-3 font-semibold transition-all"
          >
            Crear Usuario
          </button>
        </div>
      </Modal>
    </div>
  );
}
