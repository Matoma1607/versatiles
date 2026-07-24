import { useState } from 'react';
import { ShoppingBag, Menu, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NOMBRE_MARCA } from '../config';

interface HeaderProps {
  categorias: string[];
  categoriaSeleccionada: string | null;
  onSelectCategoria: (cat: string | null) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenConfig: () => void;
  apiConnected: boolean;
  marcaSeleccionada: string | null;
  onSelectMarca: (marca: string | null) => void;
  productos: any[];
  currentView?: 'catalog' | 'checkout' | 'success';
  onNavigateView?: (view: 'catalog' | 'checkout' | 'success') => void;
  orderResult?: {
    idPedido: string;
    cliente: string;
    total: number;
  } | null;
  onViewOrderResult?: () => void;
}

function obtenerMarcaDeProducto(nombre: string): 'Adidas' | 'Vans' | 'Pumas' | 'Otros' {
  const n = (nombre || "").toLowerCase();
  if (n.includes('adidas')) return 'Adidas';
  if (n.includes('vans')) return 'Vans';
  if (n.includes('puma')) return 'Pumas';
  return 'Otros';
}

export default function Header({
  categorias,
  categoriaSeleccionada,
  onSelectCategoria,
  cartCount,
  onOpenCart,
  onOpenConfig,
  apiConnected,
  marcaSeleccionada,
  onSelectMarca,
  productos,
  currentView = 'catalog',
  onNavigateView,
  orderResult,
  onViewOrderResult
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownClicked, setDropdownClicked] = useState(false);
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
  const logoUrl = "https://i.postimg.cc/RCtsxP9K/IMG-2590-JPG.jpg";

  const handleCategoryClick = (cat: string | null) => {
    if (currentView !== 'catalog' && onNavigateView) {
      onNavigateView('catalog');
    }
    if (categoriaSeleccionada === cat) {
      onSelectCategoria(null);
    } else {
      onSelectCategoria(cat);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => handleCategoryClick(null)}
          >
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-brand-primary/20 shadow-sm transition-transform duration-500 group-hover:scale-105">
              <img 
                src={logoUrl} 
                alt={`${NOMBRE_MARCA} Logo`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display font-black text-2xl tracking-tight leading-none">
                <span className="text-[#111111]">Versatile</span>
                <span className="text-[#831444]">Shoop</span>
              </h1>
              <span className="text-[8px] font-mono tracking-widest text-[#831444] uppercase font-bold block mt-0.5">ESTILO URBANO</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-3">
            {currentView !== 'catalog' && onNavigateView && (
              <button
                key="back-to-catalog"
                onClick={() => onNavigateView('catalog')}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-widest font-extrabold border-2 border-brand-primary text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white transition-all duration-300 flex items-center gap-1.5 group cursor-pointer shadow-sm hover:scale-105"
                title="Volver al Catálogo Principal"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Volver al Catálogo</span>
              </button>
            )}
            {categoriaSeleccionada && currentView === 'catalog' && (
              <button
                key="back-to-home"
                onClick={() => handleCategoryClick(null)}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-widest font-extrabold border-2 border-brand-primary text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white transition-all duration-300 flex items-center gap-1.5 group cursor-pointer shadow-sm hover:scale-105"
                title="Volver a Inicio / Ver todo"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Volver</span>
              </button>
            )}
            {categorias.map((cat) => {
              const isZapatillas = cat.toLowerCase() === 'zapatillas';
              if (isZapatillas) {
                return (
                  <div 
                    key={cat}
                    className="relative group"
                    onMouseEnter={() => {
                      if (!dropdownClicked) {
                        setIsDropdownOpen(true);
                      }
                    }}
                    onMouseLeave={() => {
                      setIsDropdownOpen(false);
                      setDropdownClicked(false);
                    }}
                  >
                    <button
                      onClick={() => {
                        handleCategoryClick(cat);
                        if (isDropdownOpen) {
                          setIsDropdownOpen(false);
                          setDropdownClicked(true);
                        } else {
                          setIsDropdownOpen(true);
                          setDropdownClicked(false);
                        }
                      }}
                      className={`px-5 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                        categoriaSeleccionada === cat 
                          ? 'bg-brand-primary text-white shadow-sm font-extrabold scale-105' 
                          : 'border border-gray-200 text-gray-600 hover:border-brand-primary/40 hover:text-brand-primary'
                      }`}
                    >
                      <span>{cat}</span>
                      <svg className={`w-3 h-3 opacity-60 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Subcategories Dropdown (unfolds/despliega on hover/state controlled) */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-300 z-50 min-w-[180px] ${
                      isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}>
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 px-1.5 flex flex-col gap-1">
                        <button
                          onClick={() => {
                            onSelectCategoria(cat);
                            onSelectMarca(null);
                            setIsDropdownOpen(false); // Close dropdown immediately on select
                            setDropdownClicked(true); // Keep closed until mouse leave
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs uppercase tracking-wider rounded-xl transition-all font-mono font-bold cursor-pointer ${
                            marcaSeleccionada === null && categoriaSeleccionada === cat
                              ? 'bg-[#831444]/10 text-brand-primary font-black'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-brand-primary'
                          }`}
                        >
                          Ver Todas
                        </button>
                        {['Adidas', 'Vans', 'Pumas', 'Otros'].map((marca) => {
                          const count = productos ? productos.filter((p: any) => p.categoria?.toLowerCase() === 'zapatillas' && obtenerMarcaDeProducto(p.nombre) === marca).length : 0;
                          return (
                            <button
                              key={marca}
                              onClick={() => {
                                onSelectCategoria(cat);
                                onSelectMarca(marca);
                                setIsDropdownOpen(false); // Close dropdown immediately on select
                                setDropdownClicked(true); // Keep closed until mouse leave
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs uppercase tracking-wider rounded-xl transition-all font-mono font-bold flex items-center justify-between cursor-pointer ${
                                marcaSeleccionada === marca && categoriaSeleccionada === cat
                                  ? 'bg-[#831444]/10 text-brand-primary font-black border-l-3 border-brand-primary pl-2.5'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-primary'
                              }`}
                            >
                              <span>{marca}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                marcaSeleccionada === marca && categoriaSeleccionada === cat
                                  ? 'bg-[#831444] text-white'
                                  : 'bg-gray-100 text-gray-400'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-5 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                    categoriaSeleccionada === cat 
                      ? 'bg-brand-primary text-white shadow-sm font-extrabold scale-105' 
                      : 'border border-gray-200 text-gray-600 hover:border-brand-primary/40 hover:text-brand-primary'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Order Button if present */}
            {orderResult && onViewOrderResult && (
              <button
                onClick={onViewOrderResult}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-display font-bold uppercase tracking-wider hover:bg-emerald-100 transition-all cursor-pointer shadow-xs animate-pulse"
                title="Ver tu pedido activo y enviar por WhatsApp"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="hidden sm:inline">Pedido {orderResult.idPedido}</span>
                <span className="sm:hidden">Pedido</span>
                <span className="bg-emerald-700 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                  VER
                </span>
              </button>
            )}

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-brand-deep hover:bg-brand-light transition-all duration-300 group hover:scale-105"
              aria-label="Carrito de compras"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-brand-deep group-hover:text-brand-primary transition-colors" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2.5 -right-2.5 bg-gradient-brand text-white font-display font-bold text-[10px] w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </button>

            {/* Hamburger Button (Mobile) */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full text-brand-deep hover:bg-brand-light lg:hidden transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>

          </div>
        </div>
      </header>

      {/* Sticky Active Filter sub-header bar */}
      <AnimatePresence>
        {categoriaSeleccionada && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="w-full bg-[#831444]/5 border-b border-[#831444]/10 py-3.5 px-4 sm:px-6 lg:px-8 sticky top-20 z-30 backdrop-blur-sm overflow-hidden"
          >
            <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shrink-0" />
                  <p className="text-xs font-mono text-brand-deep/80 truncate max-w-[220px] sm:max-w-none">
                    Categoría: <strong className="uppercase text-brand-primary tracking-wider">{categoriaSeleccionada}</strong>
                  </p>
                </div>

                {/* Brand Selector subcategories inside sticky bar! */}
                {categoriaSeleccionada.toLowerCase() === 'zapatillas' && (
                  <>
                    {/* Desktop Version: Clean horizontal badges */}
                    <div className="hidden sm:flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-brand-deep/40 uppercase font-bold mr-1">Marcas:</span>
                      <button
                        onClick={() => onSelectMarca(null)}
                        className={`px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                          marcaSeleccionada === null
                            ? 'bg-[#831444] text-white font-extrabold shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-500 hover:border-[#831444]/40 hover:text-[#831444] font-semibold'
                        }`}
                      >
                        Todas
                      </button>
                      {['Adidas', 'Vans', 'Pumas', 'Otros'].map((marca) => {
                        const count = productos ? productos.filter((p: any) => p.categoria?.toLowerCase() === 'zapatillas' && obtenerMarcaDeProducto(p.nombre) === marca).length : 0;
                        return (
                          <button
                            key={marca}
                            onClick={() => onSelectMarca(marca)}
                            className={`px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                              marcaSeleccionada === marca
                                ? 'bg-[#831444] text-white font-extrabold shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-500 hover:border-[#831444]/40 hover:text-[#831444] font-semibold'
                            }`}
                          >
                            <span>{marca}</span>
                            <span className={`text-[8px] px-1 rounded-full ${
                              marcaSeleccionada === marca 
                                ? 'bg-white/20 text-white font-bold' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Mobile Version: Collapsible compact selector to prevent overlapping or covering photos */}
                    <div className="flex sm:hidden flex-col gap-1.5 w-full">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono text-brand-deep/50 uppercase font-bold">Filtrar Marca:</span>
                        <button
                          onClick={() => setMobileBrandsOpen(!mobileBrandsOpen)}
                          className="px-4 py-1.5 bg-white border border-[#831444]/20 rounded-full text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#831444] flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>{marcaSeleccionada || 'Todas'}</span>
                          <svg className={`w-3 h-3 text-[#831444] transition-transform duration-300 ${mobileBrandsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      <AnimatePresence>
                        {mobileBrandsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-2xl border border-[#831444]/15 p-2 flex flex-col gap-1 mt-1 shadow-lg overflow-hidden z-50 relative"
                          >
                            <button
                              onClick={() => {
                                onSelectMarca(null);
                                setMobileBrandsOpen(false); // Collapses immediately on selection
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider rounded-xl transition-all font-bold cursor-pointer ${
                                marcaSeleccionada === null
                                  ? 'bg-[#831444]/10 text-brand-primary'
                                  : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              Todas ({productos ? productos.filter((p: any) => p.categoria?.toLowerCase() === 'zapatillas').length : 0})
                            </button>
                            {['Adidas', 'Vans', 'Pumas', 'Otros'].map((marca) => {
                              const count = productos ? productos.filter((p: any) => p.categoria?.toLowerCase() === 'zapatillas' && obtenerMarcaDeProducto(p.nombre) === marca).length : 0;
                              return (
                                <button
                                  key={marca}
                                  onClick={() => {
                                    onSelectMarca(marca);
                                    setMobileBrandsOpen(false); // Collapses immediately on selection
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider rounded-xl transition-all font-bold flex items-center justify-between cursor-pointer ${
                                    marcaSeleccionada === marca
                                      ? 'bg-[#831444]/10 text-brand-primary font-extrabold pl-5 border-l-2 border-brand-primary'
                                      : 'text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  <span>{marca}</span>
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-bold">
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>
              
              <button
                onClick={() => handleCategoryClick(null)}
                className="self-end md:self-auto px-4 py-1.5 bg-brand-primary text-white font-mono text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-brand-dark transition-all flex items-center gap-1.5 group cursor-pointer shadow-sm hover:scale-[1.03]"
              >
                <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                <span>Volver al inicio / Ver todo</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between pb-6 border-b border-brand-light">
                <div className="flex items-center gap-2">
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-8 h-8 rounded-full object-cover border border-brand-primary"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-display font-extrabold text-lg tracking-widest text-brand-deep">{NOMBRE_MARCA}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-brand-light text-brand-deep"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 flex-1 overflow-y-auto">
                <h3 className="text-xs font-mono tracking-widest text-brand-primary uppercase mb-4 px-3">CATEGORÍAS</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${
                      categoriaSeleccionada === null 
                        ? 'bg-brand-light text-brand-primary font-semibold border-l-4 border-brand-primary' 
                        : 'text-brand-deep hover:bg-brand-light'
                    }`}
                  >
                    Ver Todo
                  </button>
                  {categorias.map((cat) => {
                    const isZapatillas = cat.toLowerCase() === 'zapatillas';
                    const isSelected = categoriaSeleccionada === cat;
                    
                    return (
                      <div key={cat} className="space-y-1">
                        <button
                          onClick={() => handleCategoryClick(cat)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-brand-light text-brand-primary font-semibold border-l-4 border-brand-primary' 
                              : 'text-brand-deep hover:bg-brand-light'
                          }`}
                        >
                          <span>{cat}</span>
                          {isZapatillas && (
                            <svg className={`w-3.5 h-3.5 text-brand-primary/60 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Subcategories mobile accordion */}
                        {isZapatillas && isSelected && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 pr-2 py-1 flex flex-col gap-1 border-l border-brand-primary/10 ml-4 mt-1"
                          >
                            <button
                              onClick={() => {
                                onSelectMarca(null);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs uppercase tracking-wider rounded-lg transition-all font-mono font-bold ${
                                marcaSeleccionada === null
                                  ? 'bg-[#831444]/10 text-brand-primary'
                                  : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              Ver Todas
                            </button>
                            {['Adidas', 'Vans', 'Pumas', 'Otros'].map((marca) => {
                              const count = productos ? productos.filter((p: any) => p.categoria?.toLowerCase() === 'zapatillas' && obtenerMarcaDeProducto(p.nombre) === marca).length : 0;
                              return (
                                <button
                                  key={marca}
                                  onClick={() => {
                                    onSelectMarca(marca);
                                    setMobileMenuOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs uppercase tracking-wider rounded-lg transition-all font-mono font-bold flex items-center justify-between ${
                                    marcaSeleccionada === marca
                                      ? 'bg-[#831444]/10 text-brand-primary pl-4'
                                      : 'text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  <span>{marca}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 font-bold">
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-brand-light space-y-3">
                <p className="text-[10px] text-center text-brand-deep/50 font-mono">
                  &copy; {new Date().getFullYear()} {NOMBRE_MARCA} INDUMENTARIA
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
