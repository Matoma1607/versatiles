import { Producto, ImagenGaleria } from './types';

export const CATEGORIAS_MOCK = [
  'Remeras',
  'Pantalones',
  'Zapatillas',
  'Accesorios',
  'Gorras',
  'Perfumes',
  'Abrigos'
];

export const PRODUCTOS_MOCK: Producto[] = [
  {
    id: 1,
    nombre: "Remera Oversize Violet",
    precio: 18900,
    tallesDisponibles: ["S", "M", "L", "XL"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Remeras",
    stock: 15
  },
  {
    id: 2,
    nombre: "Remera Básica Algodón",
    precio: 14500,
    tallesDisponibles: ["M", "L", "XL"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Remeras",
    stock: 20
  },
  {
    id: 3,
    nombre: "Jean Recto Classic",
    precio: 32000,
    tallesDisponibles: ["38", "40", "42", "44", "46"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Pantalones",
    stock: 10
  },
  {
    id: 4,
    nombre: "Chino Pants Beige",
    precio: 29500,
    tallesDisponibles: ["38", "40", "42", "44"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Pantalones",
    stock: 12
  },
  {
    id: 5,
    nombre: "Zapatillas Urban White",
    precio: 58000,
    tallesDisponibles: ["39", "40", "41", "42", "43", "44"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Zapatillas",
    stock: 8
  },
  {
    id: 6,
    nombre: "Zapatillas Sport Tech",
    precio: 64000,
    tallesDisponibles: ["40", "41", "42", "43"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Zapatillas",
    stock: 6
  },
  {
    id: 7,
    nombre: "Gorro de Lana Invierno",
    precio: 9800,
    tallesDisponibles: ["Único"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Gorras",
    stock: 25
  },
  {
    id: 8,
    nombre: "Gorra Trucker Vintage",
    precio: 11500,
    tallesDisponibles: ["Único"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Gorras",
    stock: 18
  },
  {
    id: 9,
    nombre: "Campera Puffer Premium",
    precio: 72000,
    tallesDisponibles: ["S", "M", "L", "XL"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Abrigos",
    stock: 5
  },
  {
    id: 10,
    nombre: "Tapado Camel Elegante",
    precio: 89000,
    tallesDisponibles: ["M", "L"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Abrigos",
    stock: 4
  },
  {
    id: 11,
    nombre: "Perfume Noir Intense",
    precio: 38000,
    tallesDisponibles: ["100ml"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Perfumes",
    stock: 10
  },
  {
    id: 12,
    nombre: "Perfume Amber Cologne",
    precio: 35000,
    tallesDisponibles: ["100ml"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Perfumes",
    stock: 12
  },
  {
    id: 13,
    nombre: "Billetera Cuero Minimal",
    precio: 12500,
    tallesDisponibles: ["Único"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1627124718133-b8c199f365bc?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Accesorios",
    stock: 15
  },
  {
    id: 14,
    nombre: "Anillo Plata 925",
    precio: 8500,
    tallesDisponibles: ["18", "20", "22"],
    urlsImagenes: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
    ],
    categoria: "Accesorios",
    stock: 30
  }
];

export const IMAGENES_GALERIA_MOCK: ImagenGaleria[] = [
  { id: 1, urlImagen: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80", productoAsociadoId: 1, orden: 1 },
  { id: 2, urlImagen: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80", productoAsociadoId: 1, orden: 2 }
];
