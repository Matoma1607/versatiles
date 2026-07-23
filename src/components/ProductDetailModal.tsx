import { useState, useEffect } from 'react';
import { X, ShoppingCart, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Producto, ImagenGaleria } from '../types';
import { NOMBRE_MARCA } from '../config';

interface ProductDetailModalProps {
  producto: Producto | null;
  galeria: ImagenGaleria[];
  onClose: () => void;
  onAddToCart: (producto: Producto, talle: string) => void;
}

export default function ProductDetailModal({ producto, galeria, onClose, onAddToCart }: ProductDetailModalProps) {
  const [selectedTalle, setSelectedTalle] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Filtrar imágenes de la galería para este producto específico
  const imagenesDelProducto = producto 
    ? [
        ...producto.urlsImagenes, 
        ...galeria
          .filter(g => g.productoAsociadoId === producto.id)
          .sort((a, b) => a.orden - b.orden)
          .map(g => g.urlImagen)
      ]
    : [];

  // Eliminar duplicados si los hubiera
  const imagenesUnicas = Array.from(new Set(imagenesDelProducto)).filter(Boolean);

  // Si no hay imágenes, usar una por defecto
  if (producto && imagenesUnicas.length === 0) {
    imagenesUnicas.push("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80");
  }

  // Reiniciar selección de talle e índice de imagen cuando cambia el producto
  useEffect(() => {
    if (producto) {
      setSelectedTalle(producto.tallesDisponibles[0] || 'Único');
      setActiveImageIndex(0);
    }
  }, [producto]);

  if (!producto) return null;

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % imagenesUnicas.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + imagenesUnicas.length) % imagenesUnicas.length);
  };

  const handleAddToCart = () => {
    onAddToCart(producto, selectedTalle || producto.tallesDisponibles[0] || 'Único');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-brand-deep/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-brand-deep shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Image Carousel (adaptive on mobile) */}
          <div className="relative w-full md:w-1/2 bg-[#faf9f6] flex flex-col justify-between p-4 md:p-6 border-r border-gray-100">
            <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center group/carousel border border-gray-100">
              <img
                src={imagenesUnicas[activeImageIndex]}
                alt={`${producto.nombre} - Vista ${activeImageIndex + 1}`}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  producto.stock === 0 ? 'opacity-70 grayscale' : ''
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Sin Stock Central Overlay */}
              {producto.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                  <span className="px-5 py-2.5 bg-rose-600/90 text-white font-mono text-xs sm:text-sm uppercase tracking-widest font-black rounded-lg shadow-lg border border-white/20 animate-pulse">
                    SIN STOCK
                  </span>
                </div>
              )}

              {/* Navigation Arrows */}
              {imagenesUnicas.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-brand-deep shadow-md hover:scale-105 active:scale-95 transition-all md:opacity-0 group-hover/carousel:opacity-100 duration-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-brand-deep shadow-md hover:scale-105 active:scale-95 transition-all md:opacity-0 group-hover/carousel:opacity-100 duration-300 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail dots/images */}
            {imagenesUnicas.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 overflow-x-auto py-1">
                {imagenesUnicas.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className="w-12 h-15 rounded-md overflow-hidden border border-gray-200 transition-all shrink-0 cursor-pointer"
                  >
                    <img src={img} alt="Miniatura" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details Info */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[45vh] md:max-h-[90vh]">
            <div>
              {/* Category */}
              <span className="text-[9px] font-mono tracking-widest text-brand-dark uppercase bg-brand-light px-3 py-1.5 border border-brand-primary/10 rounded-sm font-bold">
                {producto.categoria}
              </span>

              {/* Title */}
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep tracking-tight mt-4 mb-2 uppercase">
                {producto.nombre}
              </h2>

              {/* Price */}
              <p className="font-mono font-bold text-2xl sm:text-3xl text-brand-dark tracking-wide mb-6">
                {formatearPrecio(producto.precio)}
              </p>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-brand-deep/60 font-light leading-relaxed mb-6 whitespace-pre-line">
                {producto.descripcion || `Prenda premium de edición limitada confeccionada bajo rigurosos controles de calidad textil. Diseñada especialmente para brindar una silueta contemporánea, durabilidad superior y un calce moderno inigualable acorde al concepto estético de ${NOMBRE_MARCA}.`}
              </p>

              {/* Size Selector Capsules */}
              {producto.stock > 0 && producto.tallesDisponibles.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-mono font-bold tracking-widest text-brand-deep/60 uppercase">
                      Talle Seleccionado: <span className="text-brand-primary font-mono text-xs">{selectedTalle}</span>
                    </label>
                    <span className="text-[10px] font-mono text-brand-deep/40 uppercase tracking-wider underline cursor-pointer hover:text-brand-primary">
                      Tabla de Talles
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {producto.tallesDisponibles.map((talle) => (
                      <button
                        key={talle}
                        onClick={() => setSelectedTalle(talle)}
                        className={`min-w-10 h-10 px-3 rounded-md text-xs font-mono tracking-wider flex items-center justify-center border transition-all cursor-pointer ${
                          selectedTalle === talle
                            ? 'bg-brand-deep border-brand-deep text-white font-semibold scale-105 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary bg-white'
                        }`}
                      >
                        {talle}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock status detail */}
              <div className="mb-6">
                {producto.stock === 0 ? (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-rose-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Producto temporalmente agotado. Envíanos un mensaje para reservarlo.
                  </div>
                ) : producto.stock <= 5 ? (
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-amber-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    ¡Stock Crítico! Quedan solo {producto.stock} unidades en nuestro depósito.
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Stock disponible para entrega inmediata.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions and Trust Badges */}
            <div>
              {/* CTA Action */}
              <button
                onClick={handleAddToCart}
                disabled={producto.stock === 0}
                className={`w-full py-4 rounded-lg font-mono text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  producto.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed border-gray-200'
                    : 'bg-brand-deep hover:bg-brand-dark text-white shadow-sm'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {producto.stock === 0 ? 'Producto Agotado' : 'Añadir al Carrito de Compras'}
              </button>

              {/* Brand Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-col items-center text-center p-2">
                  <ShieldCheck className="w-4 h-4 text-brand-primary mb-1" />
                  <span className="text-[10px] font-semibold text-brand-deep">Garantía</span>
                  <span className="text-[8px] text-brand-deep/50">Compra 100% Segura</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <Truck className="w-4 h-4 text-brand-primary mb-1" />
                  <span className="text-[10px] font-semibold text-brand-deep">Envíos</span>
                  <span className="text-[8px] text-brand-deep/50">A todo el País</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <RotateCcw className="w-4 h-4 text-brand-primary mb-1" />
                  <span className="text-[10px] font-semibold text-brand-deep">Cambios</span>
                  <span className="text-[8px] text-brand-deep/50">30 días de plazo</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
