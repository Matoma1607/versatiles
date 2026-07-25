import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Loader2,
  Info,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  MessageCircle
} from 'lucide-react';

import Header from './components/Header';
import Hero from './components/Hero';
import AutoSlider from './components/AutoSlider';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutForm from './components/CheckoutForm';
import SuccessScreen from './components/SuccessScreen';
import ApiConfigModal from './components/ApiConfigModal';

import { Producto, ItemCarrito, ImagenGaleria, MetodoEntrega, PedidoSubmit } from './types';
import { PRODUCTOS_MOCK, CATEGORIAS_MOCK, IMAGENES_GALERIA_MOCK } from './mockData';
import { GOOGLE_APPS_SCRIPT_URL, NOMBRE_MARCA, WHATSAPP_NUMERO, ALIAS_TRANSFERENCIA, EMAIL_CONTACTO } from './config';

// Helper function to detect brand from product name
export function obtenerMarcaDeProducto(prod: Producto): 'Adidas' | 'Vans' | 'Pumas' | 'Otros' {
  const nombre = (prod.nombre || "").toLowerCase();
  if (nombre.includes('adidas')) return 'Adidas';
  if (nombre.includes('vans')) return 'Vans';
  if (nombre.includes('puma')) return 'Pumas';
  return 'Otros';
}

export default function App() {
  // Global configuration & connection states
  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('VIOLETA_API_URL') || GOOGLE_APPS_SCRIPT_URL;
  });
  const [apiConnected, setApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // E-commerce items states
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_MOCK);
  const [galeria, setGaleria] = useState<ImagenGaleria[]>(IMAGENES_GALERIA_MOCK);
  const [categorias, setCategorias] = useState<string[]>(CATEGORIAS_MOCK);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [visibleCount, setVisibleCount] = useState(4);
  const [bestSellersIndex, setBestSellersIndex] = useState(0);
  const bestSellersCarouselRef = useRef<HTMLDivElement>(null);

  const esCategoriaZapatillas = categoriaSeleccionada?.toLowerCase() === 'zapatillas';

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    // Calculate index dynamically based on total scrollable width divided by 4 items
    const cardWidth = container.scrollWidth / 4;
    if (cardWidth > 0) {
      const index = Math.round(scrollLeft / cardWidth);
      setBestSellersIndex(Math.max(0, Math.min(3, index)));
    }
  };

  // Reset brand filter and reset visible count when category changes
  useEffect(() => {
    setMarcaSeleccionada(null);
    setVisibleCount(4);
  }, [categoriaSeleccionada]);

  // Reset visible items count when search or brand filter changes
  useEffect(() => {
    setVisibleCount(4);
  }, [searchTerm, marcaSeleccionada]);

  // Interactive views/modals states
  const [cart, setCart] = useState<ItemCarrito[]>(() => {
    const saved = localStorage.getItem('VIOLETA_CART');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Producto | null>(null);
  
  // Navigation View: 'catalog' | 'checkout' | 'success'
  const [currentView, setCurrentView] = useState<'catalog' | 'checkout' | 'success'>('catalog');
  
  // Checkout & Submission states
  const [submittingPedido, setSubmittingPedido] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    idPedido: string;
    cliente: string;
    gmail: string;
    telefono: string;
    metodoEntrega: MetodoEntrega;
    datosEntrega: any;
    total: number;
    items: ItemCarrito[];
  } | null>(() => {
    const saved = localStorage.getItem('VIOLETA_LAST_ORDER');
    return saved ? JSON.parse(saved) : null;
  });

  // Helper para cambiar vistas con historial del navegador (back button prevention)
  const changeView = (newView: 'catalog' | 'checkout' | 'success', pushHistory = true) => {
    setCurrentView(newView);
    if (pushHistory) {
      window.history.pushState({ view: newView }, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejo de historial del navegador para botón Volver / Atrás
  useEffect(() => {
    window.history.replaceState({ view: 'catalog' }, '', window.location.pathname);

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
      } else {
        setCurrentView('catalog');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Guardar orderResult en localStorage
  useEffect(() => {
    if (orderResult) {
      localStorage.setItem('VIOLETA_LAST_ORDER', JSON.stringify(orderResult));
    } else {
      localStorage.removeItem('VIOLETA_LAST_ORDER');
    }
  }, [orderResult]);

  // Refs for smooth scroll
  const catalogRef = useRef<HTMLDivElement>(null);

  // Set document favicon and page details
  useEffect(() => {
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/jpeg';
    link.rel = 'shortcut icon';
    link.href = 'https://i.postimg.cc/RCtsxP9K/IMG-2590-JPG.jpg';
    document.getElementsByTagName('head')[0].appendChild(link);
    document.title = `${NOMBRE_MARCA} - Tienda de Ropa Online`;
  }, []);

  // Save cart in localStorage on changes
  useEffect(() => {
    localStorage.setItem('VIOLETA_CART', JSON.stringify(cart));
  }, [cart]);

  // Fetch data from Google Sheets when API URL changes or on mount
  useEffect(() => {
    const loadStoreData = async () => {
      if (!apiUrl) {
        setApiConnected(false);
        setProductos(PRODUCTOS_MOCK);
        setGaleria(IMAGENES_GALERIA_MOCK);
        return;
      }

      setIsLoading(true);
      setApiError(null);

      try {
        // Añadir timestamp para evitar caching de Apps Script
        const response = await fetch(`${apiUrl}?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.success) {
          // Normalizar productos de la respuesta de Apps Script (manejando acentos, mayúsculas y espacios del sheet)
          const rawProductos = data.productos || [];
          const normalizedProducts: Producto[] = rawProductos.map((item: any) => {
            const id = Number(item.id ?? item.ID ?? 0);
            const nombre = String(item.nombre ?? item.Nombre ?? "");
            const precio = Number(item.precio ?? item.Precio ?? 0);
            
            let tallesDisponibles: string[] = [];
            if (item.tallesDisponibles) {
              tallesDisponibles = Array.isArray(item.tallesDisponibles) ? item.tallesDisponibles : [item.tallesDisponibles];
            } else if (item["Talles disponibles"]) {
              tallesDisponibles = Array.isArray(item["Talles disponibles"]) ? item["Talles disponibles"] : [item["Talles disponibles"]];
            }
            
            let urlsImagenes: string[] = [];
            if (item.urlsImagenes) {
              urlsImagenes = Array.isArray(item.urlsImagenes) ? item.urlsImagenes : [item.urlsImagenes];
            } else if (item["URLs de imágenes"]) {
              urlsImagenes = Array.isArray(item["URLs de imágenes"]) ? item["URLs de imágenes"] : [item["URLs de imágenes"]];
            } else if (item["URL de imagen"]) {
              urlsImagenes = [item["URL de imagen"]];
            }
            
            const categoria = String(item.categoria ?? item.Categoría ?? item.Categoria ?? "");
            const stock = Number(item.stock ?? item.Stock ?? 0);
            const descripcion = item.descripcion ?? item.Descripción ?? item.Descripcion ?? "";

            return {
              id,
              nombre,
              precio,
              tallesDisponibles,
              urlsImagenes,
              categoria,
              stock,
              descripcion: descripcion ? String(descripcion) : undefined
            };
          }).filter((p: Producto) => p.id > 0);

          // Normalizar galería de la respuesta de Apps Script
          const rawGaleria = data.galeria || [];
          const normalizedGaleria: ImagenGaleria[] = rawGaleria.map((item: any) => {
            const id = Number(item.id ?? item.ID ?? 0);
            const urlImagen = String(item.urlImagen ?? item["URL de imagen"] ?? item.url_imagen ?? "");
            const productoAsociadoId = Number(item.productoAsociadoId ?? item["Producto asociado (ID)"] ?? item.producto_asociado_id ?? 0);
            const orden = Number(item.orden ?? item.Orden ?? 0);

            return {
              id,
              urlImagen,
              productoAsociadoId,
              orden
            };
          }).filter((g: ImagenGaleria) => g.id > 0);

          setProductos(normalizedProducts.length > 0 ? normalizedProducts : PRODUCTOS_MOCK);
          setGaleria(normalizedGaleria.length > 0 ? normalizedGaleria : IMAGENES_GALERIA_MOCK);
          
          // Extraer categorías únicas de los productos devueltos y combinarlas con CATEGORIAS_MOCK para que nunca desaparezcan las demás categorías
          const finalProducts = normalizedProducts.length > 0 ? normalizedProducts : PRODUCTOS_MOCK;
          const sheetCats = finalProducts.map((p: Producto) => p.categoria).filter(Boolean);
          const catsSet = new Set<string>();
          // Agregar primero las de CATEGORIAS_MOCK para mantener el orden original
          CATEGORIAS_MOCK.forEach(cat => catsSet.add(cat));
          // Agregar las del sheet (normalizando para no duplicar por capitalización)
          sheetCats.forEach(cat => {
            const exists = Array.from(catsSet).some(existing => existing.toLowerCase() === cat.toLowerCase());
            if (!exists) {
              catsSet.add(cat);
            }
          });
          setCategorias(Array.from(catsSet));
          
          setApiConnected(true);
        } else {
          throw new Error(data.error || 'No se pudieron extraer los productos.');
        }
      } catch (err: any) {
        console.warn("Error cargando desde Google Sheets. Usando datos mock pre-cargados.", err);
        setApiError(err.toString());
        setApiConnected(false);
        // Mantener productos mock predefinidos
        setProductos(PRODUCTOS_MOCK);
        setGaleria(IMAGENES_GALERIA_MOCK);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreData();
  }, [apiUrl]);

  const handleSaveApiUrl = (newUrl: string) => {
    if (newUrl) {
      localStorage.setItem('VIOLETA_API_URL', newUrl);
    } else {
      localStorage.removeItem('VIOLETA_API_URL');
    }
    setApiUrl(newUrl);
  };

  const handleAddToCart = (producto: Producto, talle: string) => {
    const idUnica = `${producto.id}-${talle}`;

    setCart((prevCart) => {
      // Si existía un pedido registrado previamente, fusionamos sus prendas con el carrito
      // para que el usuario pueda sumar nuevos productos en un ÚNICO pedido unificado
      let baseCart = [...prevCart];
      if (orderResult && orderResult.items && orderResult.items.length > 0) {
        orderResult.items.forEach((orderItem) => {
          if (!baseCart.some((item) => item.idUnica === orderItem.idUnica)) {
            baseCart.push(orderItem);
          }
        });
      }

      const existing = baseCart.find((item) => item.idUnica === idUnica);
      if (existing) {
        // Validar no superar el stock
        const nuevaCantidad = Math.min(producto.stock, existing.cantidad + 1);
        return baseCart.map((item) => 
          item.idUnica === idUnica ? { ...item, cantidad: nuevaCantidad } : item
        );
      } else {
        return [...baseCart, { idUnica, producto, talle, cantidad: 1 }];
      }
    });

    // Limpiar orderResult individual para consolidar todo en un ÚNICO CARRITO UNIFICADO
    if (orderResult) {
      setOrderResult(null);
      localStorage.removeItem('VIOLETA_LAST_ORDER');
    }

    // Abrir carrito lateral de inmediato para feedback instantáneo del usuario
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (idUnica: string, change: number) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.idUnica === idUnica) {
          const nuevaCant = item.cantidad + change;
          // Validar límites entre 1 y el stock máximo del producto
          if (nuevaCant >= 1 && nuevaCant <= item.producto.stock) {
            return { ...item, cantidad: nuevaCant };
          }
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (idUnica: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.idUnica !== idUnica));
  };

  const handleScrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStartCheckout = () => {
    setIsCartOpen(false);
    changeView('checkout');
  };

  const handleSubmitPedido = async (pedidoData: {
    cliente: string;
    gmail: string;
    telefono: string;
    metodoEntrega: MetodoEntrega;
    datosEntrega: any;
  }) => {
    setSubmittingPedido(true);

    const totalCompra = cart.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
    
    // Formatear productos para enviar al backend
    const productosParaEnviar = cart.map((item) => ({
      id: item.producto.id,
      nombre: item.producto.nombre,
      talle: item.talle,
      cantidad: item.cantidad,
      precio: item.producto.precio
    }));

    // Generar un ID de pedido corto, limpio y fácil de guiar (ej: PED-4829)
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    let idGenerado = `PED-${numeroAleatorio}`;

    const payload: PedidoSubmit = {
      idPedido: idGenerado,
      cliente: pedidoData.cliente,
      gmail: pedidoData.gmail,
      telefono: pedidoData.telefono,
      metodoEntrega: pedidoData.metodoEntrega,
      datosEntrega: pedidoData.datosEntrega,
      productos: productosParaEnviar,
      total: totalCompra
    };

    if (apiUrl) {
      try {
        // Enviar pedido real a Google Sheets Apps Script
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'text/plain' // Evita preflight OPTIONS de CORS que Apps Script a veces rechaza
          }
        });

        const resData = await response.json();
        if (resData && resData.success) {
          idGenerado = resData.idPedido || idGenerado;
        } else {
          console.warn("Fallo del Apps Script en procesar, simulando éxito localmente", resData);
        }
      } catch (err) {
        console.warn("Fallo de red conectando al Apps Script, simulando pedido de forma segura", err);
      }
    }

    // Registrar el resultado de la compra
    const resultObj = {
      idPedido: idGenerado,
      cliente: pedidoData.cliente,
      gmail: pedidoData.gmail,
      telefono: pedidoData.telefono,
      metodoEntrega: pedidoData.metodoEntrega,
      datosEntrega: pedidoData.datosEntrega,
      total: totalCompra,
      items: [...cart]
    };

    setOrderResult(resultObj);
    localStorage.setItem('VIOLETA_LAST_ORDER', JSON.stringify(resultObj));
    
    // Vaciar carrito activo al completar el pedido
    setCart([]);
    
    // Avanzar a pantalla de éxito preservando la sesión
    setSubmittingPedido(false);
    changeView('success');
  };

  const handleRestoreOrderCart = () => {
    if (orderResult && orderResult.items && orderResult.items.length > 0) {
      setCart((prevCart) => {
        let baseCart = [...prevCart];
        orderResult.items.forEach((orderItem) => {
          if (!baseCart.some((item) => item.idUnica === orderItem.idUnica)) {
            baseCart.push(orderItem);
          }
        });
        return baseCart;
      });
      setOrderResult(null);
      localStorage.removeItem('VIOLETA_LAST_ORDER');
      setIsCartOpen(true);
    }
  };

  const handleBackFromSuccess = () => {
    if (orderResult && orderResult.items && orderResult.items.length > 0) {
      setCart((prevCart) => {
        let baseCart = [...prevCart];
        orderResult.items.forEach((orderItem) => {
          if (!baseCart.some((item) => item.idUnica === orderItem.idUnica)) {
            baseCart.push(orderItem);
          }
        });
        return baseCart;
      });
      setOrderResult(null);
      localStorage.removeItem('VIOLETA_LAST_ORDER');
    }
    changeView('catalog');
  };

  const handleResetStore = () => {
    setOrderResult(null);
    localStorage.removeItem('VIOLETA_LAST_ORDER');
    setCart([]);
    changeView('catalog');
    setCategoriaSeleccionada(null);
    setSearchTerm('');
  };

  // Filtrado y Ordenamiento de Productos
  const productosFiltrados = productos
    .filter((prod) => {
      const coincideCategoria = !categoriaSeleccionada || prod.categoria === categoriaSeleccionada;
      const coincideBusqueda = !searchTerm.trim() || 
        prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      
      const coincideMarca = !esCategoriaZapatillas || !marcaSeleccionada || obtenerMarcaDeProducto(prod) === marcaSeleccionada;

      return coincideCategoria && coincideBusqueda && coincideMarca;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.precio - b.precio;
      if (sortBy === 'price-desc') return b.precio - a.precio;
      return 0; // Orden por defecto (ID)
    });

  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc] text-brand-deep w-full max-w-full overflow-x-hidden">
      
      {/* Header */}
      <Header
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onSelectCategoria={setCategoriaSeleccionada}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenConfig={() => setIsConfigOpen(true)}
        apiConnected={apiConnected}
        marcaSeleccionada={marcaSeleccionada}
        onSelectMarca={setMarcaSeleccionada}
        productos={productos}
        currentView={currentView}
        onNavigateView={(view) => changeView(view)}
        orderResult={orderResult}
        onViewOrderResult={() => changeView('success')}
      />

      {/* Main Content Layout */}
      <main className="flex-grow w-full max-w-full overflow-x-hidden">
        
        {currentView === 'catalog' && (
          <>
            {/* Hero Section */}
            <Hero onScrollToCatalog={handleScrollToCatalog} />

            {/* Destacado: Lo Más Vendidos */}
            {!categoriaSeleccionada && (
              <section className="bg-brand-light border-b border-gray-100 py-12 md:py-16 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-brand-primary uppercase font-bold bg-brand-primary/10 px-2.5 py-1 rounded-sm">
                        Best Sellers
                      </span>
                      <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-deep tracking-tight uppercase mt-2">
                        Lo Más Vendido
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="lg:hidden text-[10px] font-mono font-bold text-brand-primary/60 uppercase tracking-wider animate-pulse flex items-center gap-1 bg-brand-primary/5 px-2 py-1 rounded">
                        Deslizar ↔
                      </span>
                      <button 
                        onClick={handleScrollToCatalog}
                        className="text-xs font-mono uppercase tracking-widest font-bold text-brand-primary hover:text-brand-dark flex items-center gap-1.5 group cursor-pointer"
                      >
                        <span className="hidden lg:inline">Ver colección completa</span>
                        <span className="lg:hidden">Ver todo</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    ref={bestSellersCarouselRef}
                    onScroll={handleCarouselScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-2 -mx-4 px-4 no-scrollbar sm:-mx-6 sm:px-6 sm:gap-6 md:gap-8 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
                  >
                    {(productos.filter(p => [1, 5, 9, 11].includes(p.id)).length > 0
                      ? productos.filter(p => [1, 5, 9, 11].includes(p.id))
                      : productos.slice(0, 4)
                    ).map((prod) => (
                      <div 
                        key={`best-${prod.id}`}
                        className="w-[285px] min-[400px]:w-[315px] sm:w-[340px] shrink-0 lg:w-auto lg:shrink snap-start"
                      >
                        <ProductCard
                          producto={prod}
                          onAddToCart={handleAddToCart}
                          onProductClick={setActiveProduct}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Mobile & Tablet Pager Indicators / Indicadores Visuales */}
                  <div className="flex lg:hidden justify-center items-center gap-2.5 mt-2">
                    {(productos.filter(p => [1, 5, 9, 11].includes(p.id)).length > 0
                      ? productos.filter(p => [1, 5, 9, 11].includes(p.id))
                      : productos.slice(0, 4)
                    ).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (bestSellersCarouselRef.current) {
                            const container = bestSellersCarouselRef.current;
                            const cardWidth = container.scrollWidth / 4;
                            container.scrollTo({
                              left: idx * cardWidth,
                              behavior: 'smooth'
                            });
                          }
                        }}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          bestSellersIndex === idx 
                            ? 'w-7 bg-[#831444]' 
                            : 'w-2 bg-gray-300/80 hover:bg-[#831444]/40'
                        }`}
                        aria-label={`Ir al producto ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Galería auto-deslizable Lookbook */}
            {!categoriaSeleccionada && <AutoSlider />}

            {/* Catalog Container */}
            <div 
              ref={catalogRef} 
              id="catalog-section"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 scroll-mt-20"
            >
              
              {/* Category selector, Search & Sort row */}
              <div className="mb-8 md:mb-12 space-y-4">
                
                {/* Title and Category list */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    {categoriaSeleccionada && (
                      <button
                        onClick={() => {
                          setCategoriaSeleccionada(null);
                          handleScrollToCatalog();
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light hover:bg-brand-primary/10 text-brand-primary font-mono text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all mb-3 group cursor-pointer shadow-sm hover:scale-[1.01]"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                        <span>Volver al inicio / Ver todo</span>
                      </button>
                    )}
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep tracking-tight flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-brand-primary" />
                      Nuestras Prendas
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-deep/50 font-light mt-1">
                      {categoriaSeleccionada ? `Explorando colección de ${categoriaSeleccionada}` : 'Explorando colección completa de la temporada'}
                    </p>
                  </div>

                  {/* Active filters summary */}
                  {apiConnected && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] tracking-wider font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      CONECTADO A GOOGLE SHEETS
                    </span>
                  )}
                  {apiError && !apiConnected && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono text-[10px] tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      MODO SIMULACIÓN (SHEETS INACTIVO)
                    </span>
                  )}
                </div>

                {/* Search and Sort panel */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Buscar por prenda, remera, pantalón..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-brand-light bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm shadow-sm"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-deep/30" />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-brand-deep/50 hover:text-brand-primary font-bold"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Pricing sort dropdown */}
                  <div className="relative shrink-0 min-w-[200px]">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-2xl border border-brand-light bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm shadow-sm text-brand-deep cursor-pointer appearance-none"
                    >
                      <option value="default">Relevancia / Orden</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                    </select>
                    <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-deep/30 pointer-events-none" />
                  </div>
                </div>

                {/* Brand Selector for Zapatillas category */}
                {esCategoriaZapatillas && (
                  <div className="pt-5 mt-4 border-t border-gray-100/80">
                    <span className="text-xs font-mono uppercase tracking-wider text-brand-deep/50 block mb-3 font-extrabold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                      Filtrar por Marca:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setMarcaSeleccionada(null)}
                        className={`px-4.5 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                          marcaSeleccionada === null
                            ? 'bg-[#831444] text-white shadow-md font-black scale-105'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#831444]/40 hover:text-[#831444] font-semibold'
                        }`}
                      >
                        Ver todas
                      </button>
                      {['Adidas', 'Vans', 'Pumas', 'Otros'].map((marca) => {
                        // Count items in this brand under Zapatillas category
                        const count = productos.filter(p => p.categoria?.toLowerCase() === 'zapatillas' && obtenerMarcaDeProducto(p) === marca).length;
                        return (
                          <button
                            key={marca}
                            onClick={() => setMarcaSeleccionada(marca)}
                            className={`px-4.5 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                              marcaSeleccionada === marca
                                ? 'bg-[#831444] text-white shadow-md font-black scale-105'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#831444]/40 hover:text-[#831444] font-semibold'
                            }`}
                          >
                            <span>{marca}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              marcaSeleccionada === marca 
                                ? 'bg-white/20 text-white font-extrabold' 
                                : 'bg-gray-100 text-gray-500 font-bold'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Loader or Grid */}
              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                  <p className="text-sm font-mono text-brand-primary tracking-widest uppercase">Cargando catálogo oficial...</p>
                </div>
              ) : productosFiltrados.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-white border border-dashed border-brand-medium/30 rounded-3xl p-8 max-w-md mx-auto">
                  <AlertCircle className="w-10 h-10 text-brand-primary/40 mx-auto" />
                  <div>
                    <h4 className="font-display font-bold text-lg text-brand-deep">No se encontraron prendas</h4>
                    <p className="text-xs text-brand-deep/50 mt-1 leading-relaxed">
                      No hay productos que coincidan con la búsqueda "{searchTerm}" en la categoría seleccionada. Intenta limpiar los filtros.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSearchTerm(''); setCategoriaSeleccionada(null); }}
                    className="px-5 py-2 rounded-full bg-brand-light text-brand-primary font-display font-semibold text-xs tracking-wide hover:bg-brand-primary/20 transition-all"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                /* Grid cards */
                <div className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {productosFiltrados.slice(0, visibleCount).map((prod) => (
                      <ProductCard
                        key={prod.id}
                        producto={prod}
                        onAddToCart={handleAddToCart}
                        onProductClick={setActiveProduct}
                      />
                    ))}
                  </div>

                  {/* Show More Button */}
                  {productosFiltrados.length > visibleCount && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 4)}
                        className="px-8 py-3.5 bg-brand-primary text-white font-mono text-xs uppercase tracking-widest font-bold rounded-full hover:bg-brand-dark transition-all cursor-pointer shadow-md flex items-center gap-2 group hover:scale-[1.02]"
                      >
                        Ver más prendas
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

        {/* View: Checkout Form */}
        {currentView === 'checkout' && (
          cart.length > 0 ? (
            <CheckoutForm
              cartItems={cart}
              onBack={() => changeView('catalog')}
              onSubmit={handleSubmitPedido}
              isSubmitting={submittingPedido}
            />
          ) : orderResult ? (
            <SuccessScreen
              idPedido={orderResult.idPedido}
              cliente={orderResult.cliente}
              gmail={orderResult.gmail}
              telefono={orderResult.telefono}
              metodoEntrega={orderResult.metodoEntrega}
              datosEntrega={orderResult.datosEntrega}
              cartItems={orderResult.items}
              total={orderResult.total}
              onReset={handleResetStore}
              onBackToStore={handleBackFromSuccess}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-brand-primary mx-auto opacity-80" />
              <h3 className="font-display font-bold text-lg text-brand-deep uppercase">Tu carrito está vacío</h3>
              <p className="text-xs text-brand-deep/60">Agrega productos desde nuestro catálogo antes de realizar un pedido.</p>
              <button 
                onClick={() => changeView('catalog')} 
                className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider hover:bg-brand-dark transition-all cursor-pointer shadow-sm"
              >
                Ir al Catálogo
              </button>
            </div>
          )
        )}

        {/* View: Success order confirmation screen */}
        {currentView === 'success' && orderResult && (
          <SuccessScreen
            idPedido={orderResult.idPedido}
            cliente={orderResult.cliente}
            gmail={orderResult.gmail}
            telefono={orderResult.telefono}
            metodoEntrega={orderResult.metodoEntrega}
            datosEntrega={orderResult.datosEntrega}
            cartItems={orderResult.items}
            total={orderResult.total}
            onReset={handleResetStore}
            onBackToStore={handleBackFromSuccess}
          />
        )}

      </main>

      {/* Cart lateral slide drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onStartCheckout={handleStartCheckout}
        orderResult={orderResult}
        onViewOrderResult={() => changeView('success')}
        onRestoreOrderCart={handleRestoreOrderCart}
      />

      {/* Detailed product modal view */}
      <ProductDetailModal
        producto={activeProduct}
        galeria={galeria}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Backend API Configuration Modal */}
      <ApiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        savedUrl={apiUrl}
        onSaveUrl={handleSaveApiUrl}
      />

      {/* Footer */}
      <footer className="bg-brand-deep text-brand-light border-t border-brand-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-brand-primary/10">
            
            {/* Logo/Identity column */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-primary shadow-sm">
                  <img 
                    src="https://i.postimg.cc/RCtsxP9K/IMG-2590-JPG.jpg" 
                    alt="Logo Versatile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-display font-extrabold text-xl tracking-widest text-white">{NOMBRE_MARCA}</h3>
              </div>
              <p className="text-xs text-brand-light/60 leading-relaxed font-light">
                Una selección contemporánea pensada para quienes conciben el vestir como una declaración de identidad urbana y profesional. Desde 2023 vistiendo bien a la gente.
              </p>
              
              <div className="pt-2">
                <span className="text-[10px] font-mono tracking-widest text-brand-primary uppercase font-bold bg-brand-primary/10 border border-brand-primary/30 px-3 py-1 rounded-full text-brand-light">
                  MERCADO PAGO ALIAS COPIABLE
                </span>
              </div>
            </div>

            {/* Quick specifications column */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Atención y Retiro</h4>
              <ul className="space-y-3 text-xs text-brand-light/60 font-light">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>Teniente Berdina, Barceló nro 9 - Tucumán</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>Atención 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>{EMAIL_CONTACTO}</span>
                </li>
              </ul>
            </div>

            {/* Trust and warranty column */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Garantía y Envíos</h4>
              <p className="text-xs text-brand-light/60 leading-relaxed font-light">
                ¿Tienes dudas sobre los talles o el proceso de pago por transferencia? No te preocupes. Escríbenos directamente a WhatsApp antes de confirmar la compra y te asesoramos al instante.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-brand-light/80">Andreani oficial</span>
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-brand-light/80">Pago 100% Manual</span>
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-brand-light/80">Cambios Rápidos</span>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-brand-light/40 font-mono">
            <p>&copy; {new Date().getFullYear()} {NOMBRE_MARCA} INDUMENTARIA. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1">
              Desarrollado por{" "}
              <a 
                href="https://www.instagram.com/smatias_n/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline font-bold transition-colors"
              >
                Matias Salazar
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent("¡Hola! ✨ Bienvenido/a a VersatileShoop.\n\n¡Nos alegra mucho saludarte! En un momento uno de nuestros asesores estará con vos para ayudarte a armar tu outfit ideal.\n\n🔥 ¿Quieres adelantarte? Chequea lo último que llegó a la tienda: https://www.instagram.com/versatile_shoop?igsh=M2Y5bDlhMmtlczds")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] text-white px-4 py-3.5 rounded-full shadow-2xl hover:bg-[#128C7E] transition-all hover:scale-105 group cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-5.5 h-5.5 shrink-0 fill-white/10" />
        <span className="hidden sm:inline text-xs font-mono tracking-widest font-bold uppercase">Escríbenos</span>
      </a>

    </div>
  );
}
