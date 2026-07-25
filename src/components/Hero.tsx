import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { NOMBRE_MARCA } from '../config';

interface HeroProps {
  onScrollToCatalog: () => void;
}

export default function Hero({ onScrollToCatalog }: HeroProps) {
  // Imagen editorial masculina y urbana de alta calidad
  const heroImage = "https://i.postimg.cc/3NNrRVnm/IMG-0682.avif";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#faf0f4] via-[#fbf5f7] to-[#faf9f6] border-b border-gray-100 min-h-[480px] lg:min-h-[560px] flex items-center">
      
      {/* Decorative ambient color gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#831444]/5 via-transparent to-white/40 pointer-events-none" />

      {/* Soft brand gradient glow behind the text */}
      <div 
        className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none opacity-30 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, rgba(131,20,68,0.2) 0%, rgba(200,160,180,0.1) 50%, rgba(250,249,246,0) 100%)'
        }}
      />

      {/* Grid container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Editorial Column */}
        <div className="lg:col-span-7 space-y-6 md:pr-8 relative">
          
          {/* Subtle gradient glow backdrop behind text */}
          <div className="absolute inset-0 -m-6 rounded-3xl bg-gradient-to-br from-[#831444]/8 via-[#831444]/2 to-transparent blur-2xl pointer-events-none z-0" />
          
          {/* Accent Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 inline-flex items-center gap-2 text-brand-primary font-mono text-xs tracking-widest font-bold uppercase"
          >
            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></span>
            NUEVA TEMPORADA
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative z-10 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-black tracking-tight uppercase leading-[0.95]"
          >
            Estilo Urbano <br />
            <span className="text-black block mt-1.5">
              Sin Límites.
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 text-sm sm:text-base text-brand-deep/60 font-light leading-relaxed max-w-lg"
          >
            Una selección contemporánea pensada para quienes conciben el vestir como una declaración de identidad urbana y profesional. Desde 2023 vistiendo bien a la gente.
          </motion.p>

          {/* Call To Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative z-10 flex flex-wrap gap-3.5 pt-2"
          >
            <button
              onClick={onScrollToCatalog}
              className="px-7 py-3.5 rounded-full bg-brand-deep text-white font-mono text-xs uppercase tracking-widest font-bold hover:bg-brand-dark shadow-sm transition-all duration-300 flex items-center gap-2 group cursor-pointer"
            >
              Explorar Catálogo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

        </div>

        {/* Right Editorial Image with floating border effect */}
        <div className="hidden lg:block lg:col-span-5 relative h-[450px]">
          <div className="absolute inset-0 bg-[#e5e7eb] rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
            <img 
              src={heroImage} 
              alt="Fashion Hero Editorial" 
              className="w-full h-full object-cover object-center filter grayscale-[10%] hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Accent frame decoration */}
          <div className="absolute -inset-4 border border-brand-dark/10 rounded-3xl -z-10 pointer-events-none transform translate-x-2 translate-y-2" />
        </div>

      </div>

    </section>
  );
}
