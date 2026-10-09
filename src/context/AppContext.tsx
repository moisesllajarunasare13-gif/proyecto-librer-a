import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product, SchoolList, ServiceOrder, User, Quote, Sale, CartItem, AppRole, AuthUser } from '../types';
import { SEED_PRODUCTS, SEED_SCHOOL_LISTS, SEED_SERVICES, SEED_USERS, SEED_QUOTES, SEED_SALES } from '../data/seed';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextValue {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  schoolLists: SchoolList[];
  setSchoolLists: React.Dispatch<React.SetStateAction<SchoolList[]>>;
  services: ServiceOrder[];
  setServices: React.Dispatch<React.SetStateAction<ServiceOrder[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  appRole: AppRole;
  setAppRole: (role: AppRole) => void;
  authUser: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let toastId = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [schoolLists, setSchoolLists] = useState<SchoolList[]>(SEED_SCHOOL_LISTS);
  const [services, setServices] = useState<ServiceOrder[]>(SEED_SERVICES);
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [quotes, setQuotes] = useState<Quote[]>(SEED_QUOTES);
  const [sales, setSales] = useState<Sale[]>(SEED_SALES);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appRole, setAppRole] = useState<AppRole>('mobile');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const login = useCallback((email: string, _password: string) => {
    const user = SEED_USERS.find((u) => u.email === email && u.active);
    if (user) {
      setAuthUser({ id: user.id, name: user.name, email: user.email, role: user.role });
      setAppRole(user.role === 'admin' ? 'admin' : 'mobile');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthUser(null);
    setAppRole('mobile');
    setCart([]);
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const value: AppContextValue = {
    products, setProducts,
    schoolLists, setSchoolLists,
    services, setServices,
    users, setUsers,
    quotes, setQuotes,
    sales, setSales,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount,
    appRole, setAppRole,
    authUser, login, logout,
    toasts, showToast, removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
