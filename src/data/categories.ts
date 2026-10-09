import type { MainCategory, SubCategory } from '../types';

export const CATEGORIES: MainCategory[] = [
  {
    id: 'escolar',
    name: 'Escolar',
    icon: 'GraduationCap',
    color: '#2563eb',
    subcategories: [
      { id: 'escritura', name: 'Escritura' },
      { id: 'articulos-escritorio', name: 'Artículos de Escritorio' },
      { id: 'manualidades', name: 'Manualidades' },
      { id: 'maleteria', name: 'Maletería y Accesorios' },
      { id: 'cintas-adhesivas', name: 'Cintas Adhesivas' },
      { id: 'cuadernos', name: 'Cuadernos' },
      { id: 'arte-diseno', name: 'Arte y Diseño' },
      { id: 'blocks', name: 'Blocks' },
      { id: 'papeleria-escolar', name: 'Papelería' },
      { id: 'diccionarios-biblias', name: 'Diccionarios y Biblias' },
      { id: 'folders', name: 'Folders' },
      { id: 'forros', name: 'Forros' },
      { id: 'packs-escolar', name: 'Packs' },
      { id: 'pizarras-escolar', name: 'Pizarras' },
      { id: 'sobres-manila-escolar', name: 'Sobres Manila' },
    ],
  },
  {
    id: 'oficina',
    name: 'Oficina',
    icon: 'Briefcase',
    color: '#0891b2',
    subcategories: [
      { id: 'articulos-oficina', name: 'Artículos de Oficina' },
      { id: 'archivo-clasificacion', name: 'Archivo y Clasificación' },
      { id: 'cintas-adhesivas-oficina', name: 'Cintas Adhesivas' },
      { id: 'organizadores', name: 'Organizadores' },
    ],
  },
  {
    id: 'papeleria',
    name: 'Papelería',
    icon: 'FileText',
    color: '#ea580c',
    subcategories: [
      { id: 'papel-bond-a4', name: 'Papel Bond A4' },
      { id: 'papel-bond-a3', name: 'Papel Bond A3' },
      { id: 'papel-bulky', name: 'Papel Bulky' },
      { id: 'papeles-especiales', name: 'Papeles Especiales' },
      { id: 'papel-fotografico', name: 'Papel Fotográfico' },
      { id: 'papelografos', name: 'Papelógrafos' },
      { id: 'papel-seda', name: 'Papel Seda' },
      { id: 'papel-lustre', name: 'Papel Lustre' },
      { id: 'papel-corrugado', name: 'Papel Corrugado' },
      { id: 'pizarras-papeleria', name: 'Pizarras' },
      { id: 'libretas', name: 'Libretas' },
      { id: 'packs-papeleria', name: 'Packs' },
    ],
  },
  {
    id: 'jugueteria',
    name: 'Juguetería',
    icon: 'Gamepad2',
    color: '#db2777',
    subcategories: [
      { id: 'juegos-didacticos', name: 'Juegos Didácticos' },
      { id: 'pelotas', name: 'Pelotas' },
      { id: 'juegos-mesa', name: 'Juegos de Mesa' },
      { id: 'juguetes', name: 'Juguetes' },
      { id: 'musica', name: 'Música' },
      { id: 'rompecabezas', name: 'Rompecabezas' },
      { id: 'titere', name: 'Títeres' },
    ],
  },
];

export const getCategoryById = (id: string): MainCategory | undefined =>
  CATEGORIES.find((c) => c.id === id);

export const getCategoryName = (id: string): string =>
  getCategoryById(id)?.name ?? 'Sin categoría';

export const getSubcategoryName = (catId: string, subId: string): string => {
  const cat = getCategoryById(catId);
  if (!cat) return 'Sin subcategoría';
  return cat.subcategories.find((s) => s.id === subId)?.name ?? 'Sin subcategoría';
};

export const getSubcategories = (catId: string): SubCategory[] =>
  getCategoryById(catId)?.subcategories ?? [];

export const BRANDS: string[] = [
  'Norma',
  'Faber-Castell',
  'Crayola',
  'Maped',
  'Pilot',
  'Mongol',
  'Staedtler',
  'Casio',
  'HP',
  'Stanford',
  'Liquid Paper',
  'Sin marca',
];

export const getBrandName = (brand: string): string =>
  BRANDS.includes(brand) ? brand : 'Sin marca';
