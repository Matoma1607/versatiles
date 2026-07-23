import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ItemCarrito } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: ItemCarrito[];
  onUpdateQuantity: (idUnica: string, change: number) => void;
  onRemoveItem: (idUnica: string) => void;
  onStartCheckout: () => void;
  orderResult?: {
    idPedido: string;
    cliente: string;
    total: number;
    items: ItemCarrito[];
  } | null;
  onViewOrderResult?: () => void;
  onRestoreOrderCart?: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onStartCheckout,
  orderResult,
  onViewOrderResult,
  onRestoreOrderCart
}: CartDrawerProps) {
  
  const calcularTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  };

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-brand-deep/80 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-primary" />
                <h2 className="font-display font-bold text-lg text-brand-deep uppercase tracking-wider">Mi Carrito</h2>
                <span className="bg-brand-light text-brand-primary font-mono text-xs font-bold px-2 py-0.5 rounded-sm">
                  {cartItems.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-brand-deep transition-colors cursor-pointer"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#faf9f6]/30">
              
              {/* Last Order Banner if present and active cart is empty */}
              {cartItems.length === 0 && orderResult && (
                <div className="bg-gradient-to-br from-emerald-50 via-white to-brand-light/30 border-2 border-emerald-300 rounded-2xl p-4 shadow-sm text-left space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="font-display font-black text-xs text-emerald-900 uppercase tracking-wide">
                        Pedido Registrado
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                      {orderResult.idPedido}
                    </span>
                  </div>

                  <div className="bg-white/90 rounded-xl p-2.5 border border-emerald-100/80 space-y-1">
                    <p className="text-[11px] text-brand-deep">
                      Cliente: <strong className="text-emerald-900">{orderResult.cliente}</strong>
                    </p>
                    <p className="text-[11px] text-brand-deep/80 flex items-center justify-between">
                      <span>Total:</span>
                      <strong className="text-brand-primary font-mono text-xs">{formatearPrecio(orderResult.total)}</strong>
                    </p>
                    {orderResult.items && orderResult.items.length > 0 && (
                      <p className="text-[10px] text-gray-500 pt-1 border-t border-gray-100 truncate">
                        {orderResult.items.map(it => `${it.cantidad}x ${it.producto.nombre}`).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-0.5">
                    {onViewOrderResult && (
                      <button
                        onClick={() => {
                          onViewOrderResult();
                          onClose();
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                      >
                        <FileText className="w-4 h-4 text-white shrink-0" />
                        <span>CONTINUAR PEDIDO / WHATSAPP</span>
                      </button>
                    )}
                    {onRestoreOrderCart && orderResult.items?.length > 0 && (
                      <button
                        onClick={() => {
                          onRestoreOrderCart();
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-emerald-400 text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200 font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Sumar más prendas a este pedido</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="p-4 rounded-full bg-[#faf9f6] border border-gray-100">
                    <ShoppingBag className="w-10 h-10 text-brand-primary/60" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-brand-deep uppercase">Tu carrito está vacío</h3>
                    <p className="text-xs text-brand-deep/50 mt-1.5 max-w-xs leading-relaxed font-light">
                      ¿Aún no te decidiste? Explora nuestro catálogo de productos y suma tus prendas favoritas.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full border border-gray-200 hover:border-brand-primary text-brand-deep font-mono text-xs uppercase tracking-widest font-bold transition-all cursor-pointer"
                  >
                    Volver a la Tienda
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const prod = item.producto;
                  const mainImg = prod.urlsImagenes[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";
                                return (
                    <motion.div
                      layout
                      key={item.idUnica}
                      className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-brand-primary/40 transition-colors relative group"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-20 h-25 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                        <img src={mainImg} alt={prod.nombre} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>

                      {/* Info Detail */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-display font-bold text-sm text-brand-deep line-clamp-2 leading-tight">
                              {prod.nombre}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.idUnica)}
                              className="text-brand-deep/30 hover:text-rose-500 p-1 rounded-full hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                              aria-label="Quitar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[10px] font-mono tracking-widest text-brand-primary uppercase mt-1 inline-block font-bold">
                            Talle: <span className="text-brand-deep">{item.talle}</span>
                          </span>
                        </div>

                        {/* Quantity controls & Price */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-[#faf9f6] border border-gray-200 rounded-md p-1">
                            <button
                              onClick={() => onUpdateQuantity(item.idUnica, -1)}
                              disabled={item.cantidad <= 1}
                              className="p-1 text-brand-deep/60 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-mono text-xs font-semibold text-brand-deep">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.idUnica, 1)}
                              disabled={item.cantidad >= prod.stock}
                              className="p-1 text-brand-deep/60 hover:bg-white rounded disabled:opacity-30 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <span className="font-mono font-bold text-brand-dark text-sm">
                            {formatearPrecio(prod.precio * item.cantidad)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Pricing & CTA */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-[#faf9f6]/90 space-y-4">
                
                {/* Warning on stock bounds */}
                {cartItems.some(i => i.cantidad >= i.producto.stock) && (
                  <div className="flex items-center gap-2 text-[10px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Límite de stock disponible alcanzado en algunas prendas.</span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-brand-deep/60 font-bold">Subtotal</span>
                  <span className="font-mono font-bold text-xl text-brand-deep">
                    {formatearPrecio(calcularTotal())}
                  </span>
                </div>

                <p className="text-[11px] text-brand-deep/50 leading-relaxed font-light">
                  Los costos de envío correspondientes al correo Andreani o cadetería a domicilio se calcularán o coordinarán luego de confirmar la entrega.
                </p>

                {/* Iniciar Compra button */}
                <button
                  onClick={onStartCheckout}
                  className="w-full py-3.5 rounded-md bg-brand-deep hover:bg-brand-dark text-white font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  Iniciar Compra
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
