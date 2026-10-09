const SUBCATEGORY_IMAGES: Record<string, string> = {
  // Escolar
  'escritura': 'https://images.pexels.com/photos/18889468/pexels-photo-18889468.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'articulos-escritorio': 'https://images.pexels.com/photos/20140155/pexels-photo-20140155.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'manualidades': 'https://images.pexels.com/photos/11082996/pexels-photo-11082996.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'maleteria': 'https://images.pexels.com/photos/20818683/pexels-photo-20818683.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'cuadernos': 'https://images.pexels.com/photos/8230968/pexels-photo-8230968.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'arte-diseno': 'https://images.pexels.com/photos/6167808/pexels-photo-6167808.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'blocks': 'https://images.pexels.com/photos/7431661/pexels-photo-7431661.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'papeleria-escolar': 'https://images.pexels.com/photos/33929080/pexels-photo-33929080.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'diccionarios-biblias': 'https://images.pexels.com/photos/7635576/pexels-photo-7635576.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  // Oficina
  'articulos-oficina': 'https://images.pexels.com/photos/8617769/pexels-photo-8617769.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'archivo-clasificacion': 'https://images.pexels.com/photos/29765799/pexels-photo-29765799.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  // Papelería
  'papel-bond-a4': 'https://images.pexels.com/photos/33929080/pexels-photo-33929080.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'papel-seda': 'https://images.pexels.com/photos/33952994/pexels-photo-33952994.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'papel-lustre': 'https://images.pexels.com/photos/33929080/pexels-photo-33929080.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  // Juguetería
  'juegos-didacticos': 'https://images.pexels.com/photos/29765798/pexels-photo-29765798.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'rompecabezas': 'https://images.pexels.com/photos/9789216/pexels-photo-9789216.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'titere': 'https://images.pexels.com/photos/37873521/pexels-photo-37873521.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
};

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/28921196/pexels-photo-28921196.jpeg?auto=compress&cs=tinysrgb&h=200&w=200';

export function getSubcategoryImage(subcatId: string): string {
  return SUBCATEGORY_IMAGES[subcatId] ?? FALLBACK_IMAGE;
}
