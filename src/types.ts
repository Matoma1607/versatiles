export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  tallesDisponibles: string[];
  urlsImagenes: string[];
  categoria: string;
  stock: number;
  descripcion?: string;
}

export interface ItemCarrito {
  idUnica: string; // Combinación de id + talle
  producto: Producto;
  talle: string;
  cantidad: number;
}

export type MetodoEntrega = 'Retiro en tienda' | 'Retiro vía Andreani' | 'Envío a domicilio';

export interface DatosRetiroTienda {
  nombre: string;
  gmail: string;
  telefono: string;
}

export interface DatosAndreani {
  nombre: string;
  apellido: string;
  dni: string;
  provincia: string;
  localidad: string;
  cp: string;
  sucursal?: string;
  telefono: string;
  gmail: string;
}

export interface DatosDomicilio {
  direccion: string;
  pisoDepto?: string;
  localidad: string;
  cp: string;
  telefono: string;
  gmail: string;
  comentarios?: string;
}

export interface PedidoSubmit {
  idPedido?: string;
  cliente: string;
  gmail: string;
  telefono: string;
  metodoEntrega: MetodoEntrega;
  datosEntrega: DatosRetiroTienda | DatosAndreani | DatosDomicilio;
  productos: {
    id: number;
    nombre: string;
    talle: string;
    cantidad: number;
    precio: number;
  }[];
  total: number;
}

export interface ImagenGaleria {
  id: number;
  urlImagen: string;
  productoAsociadoId: number;
  orden: number;
}
