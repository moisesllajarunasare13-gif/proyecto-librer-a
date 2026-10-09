export type MainCategoryId = 'escolar' | 'oficina' | 'papeleria' | 'jugueteria';

export interface SubCategory {
  id: string;
  name: string;
}

export interface MainCategory {
  id: MainCategoryId;
  name: string;
  icon: string;
  color: string;
  subcategories: SubCategory[];
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: MainCategoryId;
  subcategory: string;
  brand: string;
  price: number;
  stock: number;
  minStock: number;
  active: boolean;
  createdAt: string;
  hasBarcode: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'efectivo' | 'yape_plin' | 'tarjeta';

export interface Sale {
  id: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  cashier: string;
  customerName: string;
}

export type ListStatus = 'pendiente' | 'en_proceso' | 'completada';

export interface SchoolListItem {
  name: string;
  quantity: number;
  productId?: string;
  picked: boolean;
}

export interface SchoolList {
  id: string;
  customerName: string;
  school: string;
  grade: string;
  items: SchoolListItem[];
  status: ListStatus;
  createdAt: string;
}

export type ServiceStatus = 'recibido' | 'en_proceso' | 'listo';

export interface ServiceOrder {
  id: string;
  title: string;
  customerName: string;
  phone: string;
  description: string;
  notes: string;
  estimatedPrice: number;
  status: ServiceStatus;
  createdAt: string;
  dueDate: string;
}

export type UserRole = 'admin' | 'trabajador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLogin: string;
}

export interface QuoteItem {
  name: string;
  quantity: number;
  unitPrice: number;
  available: boolean;
}

export interface Quote {
  id: string;
  listId?: string;
  customerName: string;
  school: string;
  grade: string;
  items: QuoteItem[];
  total: number;
  missingCount: number;
  createdAt: string;
}

export type AppRole = 'mobile' | 'admin';

export type MobileTab = 'scanner' | 'counter' | 'picking' | 'services';
export type AdminTab = 'dashboard' | 'catalog' | 'users' | 'quotes' | 'sales';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
