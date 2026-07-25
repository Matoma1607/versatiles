import React, { useState } from 'react';
import { ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Producto } from '../types';

interface ProductCardProps {
  key?: React.Key;
  producto: Producto;
  onAddToCart: (producto: Producto, talle: string) => void;
  onProductClick: (producto: Producto) => void;
}

export default function ProductCard({
  producto,
  onAddToCart,
  onProductClick,
}: ProductCardProps) {
  const [selectedTalle, setSelectedTalle] = useState<string>('');
  const [hovered, setHovered] = useState(false);

  const mainImage = producto.urlsImagenes[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";

  // Formateador de moneda argentina
  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir el modal al clickear el botón de agregar
    
    if (producto.stock === 0) return;
    
    // Si no seleccionó talle y hay talles disponibles, usar el primero o advertir
    const talleParaAgregar = selectedTalle || producto.tallesDisponibles[0] || 'Único';
    onAddToCart(producto, talleParaAgregar);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group rounded-xl border transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer relative ${
        producto.stock === 0
          ? 'bg-gray-100/90 border-gray-300 grayscale opacity-80 shadow-none'
          : 'bg-white border-gray-200 hover:border-black hover:ring-1 hover:ring-black/10 shadow-sm hover:shadow-md'
      }`}
      onClick={() => onProductClick(producto)}
    >
      {/* Image & Badges */}
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
        
        {/* Main Image */}
        <img
          src={mainImage}
          alt={producto.nombre}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            producto.stock === 0 ? 'opacity-70 grayscale' : 'group-hover:scale-105'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Sin Stock Central Overlay */}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
            <span className="px-4 py-2 bg-rose-600/90 text-white font-mono text-xs sm:text-sm uppercase tracking-widest font-black rounded-lg shadow-lg border border-white/20 animate-pulse">
              SIN STOCK
            </span>
          </div>
        )}

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <span className="px-5 py-2.5 rounded-full bg-white text-brand-deep font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-transform">
            <Eye className="w-4 h-4 text-brand-primary" />
            VISTA RÁPIDA
          </span>
        </div>

        {/* Stock Badges */}
        {producto.stock === 0 ? (
          <span className="absolute top-3 left-3 bg-rose-600 text-white font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-sm uppercase shadow-sm">
            AGOTADO
          </span>
        ) : producto.stock <= 5 ? (
          <span className="absolute top-3 left-3 bg-amber-600 text-white font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-sm uppercase shadow-sm animate-pulse">
            ÚLTIMAS {producto.stock} UNIDADES
          </span>
        ) : producto.id === 1 || producto.id === 5 ? (
          <span className="absolute top-3 left-3 bg-brand-dark text-white font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-sm uppercase shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" /> DESTACADO
          </span>
        ) : null}

        {/* Category Label */}
        <span className="absolute bottom-3 left-3 bg-brand-deep/80 backdrop-blur-sm text-brand-light font-mono text-[9px] tracking-widest px-2.5 py-1 rounded-sm uppercase">
          {producto.categoria}
        </span>
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Name */}
          <h3 className="font-display font-bold text-base text-brand-deep group-hover:text-brand-primary transition-colors leading-tight mb-1">
            {producto.nombre}
          </h3>
          
          {/* Price */}
          <p className="font-mono font-bold text-base text-brand-dark tracking-wide mb-4">
            {formatearPrecio(producto.precio)}
          </p>

          {/* Size Selector Capsules */}
          {producto.stock > 0 && producto.tallesDisponibles.length > 0 && (
            <div className="mb-4" onClick={(e) => e.stopPropagation()}>
              <label className="block text-[10px] font-mono tracking-wider text-brand-deep/50 uppercase mb-2">
                Talle: {selectedTalle || 'Selecciona uno'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {producto.tallesDisponibles.map((talle) => (
                  <button
                    key={talle}
                    onClick={() => setSelectedTalle(talle)}
                    className={`min-w-8 h-8 px-2 rounded-md text-[10px] font-mono tracking-wider flex items-center justify-center border transition-all cursor-pointer ${
                      selectedTalle === talle
                        ? 'bg-brand-deep border-brand-deep text-white font-semibold scale-105'
                        : 'border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary bg-white'
                    }`}
                  >
                    {talle}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={producto.stock === 0}
          className={`w-full py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            producto.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed border-gray-200'
              : 'bg-brand-deep hover:bg-brand-dark text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {producto.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
        </button>
      </div>
    </motion.div>
  );
}
