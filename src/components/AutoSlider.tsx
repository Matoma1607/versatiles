import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const IMAGES = [
  "https://i.postimg.cc/ZRT5kCNG/IMG-0697.avif",
  "https://i.postimg.cc/mkkZDJ8Q/IMG-0688.avif",
  "https://i.postimg.cc/tTX40YP0/IMG-0708.avif",
  "https://i.postimg.cc/sXVgFvSC/IMG-0664.avif",
  "https://i.postimg.cc/Y0029Zb4/IMG-0678.avif"
];

// Duplicamos el array para lograr un efecto infinito y fluido de carrusel continuo
const SLIDES = [...IMAGES, ...IMAGES, ...IMAGES];

export default function AutoSlider() {
  // Empezamos en el segundo set de imágenes para permitir scroll hacia atrás fluido
  const [currentIndex, setCurrentIndex] = useState(IMAGES.length);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tamaños responsivos para las tarjetas de fotos
  const getCardSpecs = () => {
    if (windowWidth < 640) {
      return { width: 230, gap: 16 }; // Celulares
    } else if (windowWidth < 1024) {
      return { width: 280, gap: 20 }; // Tablets
    } else {
      return { width: 320, gap: 24 }; // Escritorio
    }
  };

  const { width: cardWidth, gap } = getCardSpecs();

  // Controlar el fin de la transición para reiniciar el loop de forma invisible
  const handleTransitionEnd = () => {
    if (currentIndex >= IMAGES.length * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - IMAGES.length);
    } else if (currentIndex < IMAGES.length) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + IMAGES.length);
    }
  };

  // Reactivar la transición después de un salto invisible de índice
  useEffect(() => {
    if (!isTransitioning) {
      // Pequeño delay para permitir que el navegador aplique el cambio de posición sin animar
      const r = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(r);
    }
  }, [isTransitioning]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 3000); // Se mueve cada 3 segundos
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentIndex]);

  const handlePrev = () => {
    if (!isTransitioning) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!isTransitioning) return;
    setCurrentIndex((prev) => prev + 1);
  };

  // Calcular el offset para que la tarjeta activa quede alineada
  // Usamos un offset para centrar la tarjeta activa en la pantalla
  const offset = `calc(50vw - ${cardWidth / 2}px - ${currentIndex * (cardWidth + gap)}px)`;

  return (
    <section className="relative bg-[#faf9f6] border-y border-gray-100 py-12 md:py-16 overflow-hidden select-none">
      
      {/* Fondo degradado suave como en Estilo Urbano con el color #a46a86 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#a46a86]/12 via-transparent to-[#faf9f6]/40 pointer-events-none" />
      
      {/* Brillo de gradiente radial de marca con el color #a46a86 */}
      <div 
        className="absolute left-[10%] top-[20%] w-[450px] h-[450px] rounded-full blur-[110px] pointer-events-none opacity-30 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, rgba(164, 106, 134, 0.25) 0%, rgba(164, 106, 134, 0.05) 60%, rgba(250,249,246,0) 100%)'
        }}
      />
      <div 
        className="absolute right-0 bottom-[10%] w-[350px] h-[350px] rounded-full blur-[110px] pointer-events-none opacity-25 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, rgba(164, 106, 134, 0.2) 0%, rgba(164, 106, 134, 0.05) 60%, rgba(250,249,246,0) 100%)'
        }}
      />

      <div className="w-full relative z-10">
        
        {/* Cabecera Premium de la Sección */}
        <div className="text-center mb-8 md:mb-12 px-4">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest text-[#a46a86] uppercase font-bold bg-[#a46a86]/10 px-2.5 py-1 rounded-sm">
            <Sparkles className="w-3 h-3 animate-pulse" /> Lookbook / Galería
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-deep tracking-tight uppercase mt-2">
            Versatile en Movimiento
          </h2>
          <p className="text-xs sm:text-sm text-brand-deep/50 font-light mt-1 max-w-md mx-auto">
            Descubrí la caída, texturas y el calce real de nuestras prendas de temporada.
          </p>
        </div>

        {/* Slider Continuo */}
        <div 
          className="relative w-full"
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
          onTouchStart={stopAutoPlay}
          onTouchEnd={startAutoPlay}
        >
          {/* Contenedor principal con desborde visible */}
          <div className="w-full overflow-hidden py-4 relative flex items-center">
            
            {/* Track deslizante */}
            <div 
              className="flex items-center"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(${offset})`,
                transition: isTransitioning ? 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
              }}
            >
              {SLIDES.map((url, idx) => {
                // Determina si esta tarjeta es la "activa" en el centro para darle un sutil realce
                const isCenter = idx === currentIndex;
                
                return (
                  <div 
                    key={idx} 
                    className="shrink-0 transition-all duration-700 ease-out"
                    style={{ 
                      width: `${cardWidth}px`, 
                      marginRight: `${gap}px`,
                      transform: isCenter ? 'scale(1.03)' : 'scale(0.97)',
                      opacity: isCenter ? 1 : 0.75
                    }}
                  >
                    {/* Tarjeta de foto con estética idéntica al video de ejemplo */}
                    <div className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 bg-[#fafafa]">
                      <img 
                        src={url} 
                        alt={`Versatile look ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 hover:scale-105"
                        draggable={false}
                      />
                      {/* Sutil gradiente para mejorar contraste */}
                      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flechas de Navegación Estilo Premium */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-12 pointer-events-none z-10">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-brand-deep flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all pointer-events-auto cursor-pointer border border-gray-100"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-brand-deep flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all pointer-events-auto cursor-pointer border border-gray-100"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Indicadores de Posición en la parte inferior */}
          <div className="flex justify-center items-center gap-1.5 mt-4">
            {IMAGES.map((_, idx) => {
              const activeIndexNormalized = (currentIndex - IMAGES.length + IMAGES.length) % IMAGES.length;
              const isActive = idx === activeIndexNormalized;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    stopAutoPlay();
                    // Buscamos el set del medio para saltar de forma segura
                    setCurrentIndex(IMAGES.length + idx);
                    startAutoPlay();
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? 'w-6 bg-[#a46a86]' : 'w-1.5 bg-gray-200 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir a imagen ${idx + 1}`}
                />
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
