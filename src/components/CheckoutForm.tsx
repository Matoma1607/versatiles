import React, { useState } from 'react';
import { ArrowLeft, Store, Truck, MapPin, Loader2, Mail, Phone, CreditCard, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { MetodoEntrega, ItemCarrito } from '../types';

interface CheckoutFormProps {
  cartItems: ItemCarrito[];
  onBack: () => void;
  onSubmit: (data: {
    cliente: string;
    gmail: string;
    telefono: string;
    metodoEntrega: MetodoEntrega;
    datosEntrega: any;
  }) => void;
  isSubmitting: boolean;
}

export default function CheckoutForm({ cartItems, onBack, onSubmit, isSubmitting }: CheckoutFormProps) {
  // Read saved draft if exists, or fallback to last order data
  const savedDraft = React.useMemo(() => {
    try {
      const data = localStorage.getItem('VIOLETA_CHECKOUT_DRAFT');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && (parsed.nombreRetiro || parsed.nombreAndreani || parsed.nombreDom || parsed.metodo)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    try {
      const lastOrderData = localStorage.getItem('VIOLETA_LAST_ORDER');
      if (lastOrderData) {
        const lastOrder = JSON.parse(lastOrderData);
        if (lastOrder) {
          const metodo = lastOrder.metodoEntrega || 'Retiro en tienda';
          const cliente = lastOrder.cliente || '';
          const gmail = lastOrder.gmail || '';
          const telefono = lastOrder.telefono || '';
          const datos = lastOrder.datosEntrega || {};

          return {
            metodo,
            nombreRetiro: cliente,
            gmailRetiro: gmail,
            telRetiro: telefono,
            nombreAndreani: datos.nombre || cliente,
            apellidoAndreani: datos.apellido || '',
            dniAndreani: datos.dni || '',
            provinciaAndreani: datos.provincia || '',
            localidadAndreani: datos.localidad || '',
            cpAndreani: datos.cp || '',
            sucursalAndreani: datos.sucursal || '',
            telAndreani: datos.telefono || telefono,
            gmailAndreani: datos.gmail || gmail,
            nombreDom: cliente,
            direccionDom: datos.direccion || '',
            pisoDom: datos.pisoDepto || '',
            localidadDom: datos.localidad || '',
            cpDom: datos.cp || '',
            telDom: datos.telefono || telefono,
            gmailDom: datos.gmail || gmail,
            comentarioDom: datos.comentarios || ''
          };
        }
      }
    } catch {
      // ignore
    }

    return null;
  }, []);

  const [metodo, setMetodo] = useState<MetodoEntrega>(savedDraft?.metodo || 'Retiro en tienda');

  // Form states
  const [nombreRetiro, setNombreRetiro] = useState(savedDraft?.nombreRetiro || '');
  const [gmailRetiro, setGmailRetiro] = useState(savedDraft?.gmailRetiro || '');
  const [telRetiro, setTelRetiro] = useState(savedDraft?.telRetiro || '');

  // Andreani states
  const [nombreAndreani, setNombreAndreani] = useState(savedDraft?.nombreAndreani || '');
  const [apellidoAndreani, setApellidoAndreani] = useState(savedDraft?.apellidoAndreani || '');
  const [dniAndreani, setDniAndreani] = useState(savedDraft?.dniAndreani || '');
  const [provinciaAndreani, setProvinciaAndreani] = useState(savedDraft?.provinciaAndreani || '');
  const [localidadAndreani, setLocalidadAndreani] = useState(savedDraft?.localidadAndreani || '');
  const [cpAndreani, setCpAndreani] = useState(savedDraft?.cpAndreani || '');
  const [sucursalAndreani, setSucursalAndreani] = useState(savedDraft?.sucursalAndreani || '');
  const [telAndreani, setTelAndreani] = useState(savedDraft?.telAndreani || '');
  const [gmailAndreani, setGmailAndreani] = useState(savedDraft?.gmailAndreani || '');

  // Domicilio states
  const [nombreDom, setNombreDom] = useState(savedDraft?.nombreDom || ''); // Nombre para identificar la entrega
  const [direccionDom, setDireccionDom] = useState(savedDraft?.direccionDom || '');
  const [pisoDom, setPisoDom] = useState(savedDraft?.pisoDom || '');
  const [localidadDom, setLocalidadDom] = useState(savedDraft?.localidadDom || '');
  const [cpDom, setCpDom] = useState(savedDraft?.cpDom || '');
  const [telDom, setTelDom] = useState(savedDraft?.telDom || '');
  const [gmailDom, setGmailDom] = useState(savedDraft?.gmailDom || '');
  const [comentarioDom, setComentarioDom] = useState(savedDraft?.comentarioDom || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save form draft to localStorage
  React.useEffect(() => {
    const draft = {
      metodo,
      nombreRetiro,
      gmailRetiro,
      telRetiro,
      nombreAndreani,
      apellidoAndreani,
      dniAndreani,
      provinciaAndreani,
      localidadAndreani,
      cpAndreani,
      sucursalAndreani,
      telAndreani,
      gmailAndreani,
      nombreDom,
      direccionDom,
      pisoDom,
      localidadDom,
      cpDom,
      telDom,
      gmailDom,
      comentarioDom
    };
    localStorage.setItem('VIOLETA_CHECKOUT_DRAFT', JSON.stringify(draft));
  }, [
    metodo, nombreRetiro, gmailRetiro, telRetiro,
    nombreAndreani, apellidoAndreani, dniAndreani, provinciaAndreani, localidadAndreani, cpAndreani, sucursalAndreani, telAndreani, gmailAndreani,
    nombreDom, direccionDom, pisoDom, localidadDom, cpDom, telDom, gmailDom, comentarioDom
  ]);

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

  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (metodo === 'Retiro en tienda') {
      if (!nombreRetiro.trim()) newErrors.nombreRetiro = 'El nombre es obligatorio para el retiro';
      if (!telRetiro.trim()) newErrors.telRetiro = 'El teléfono es obligatorio';
      if (!gmailRetiro.trim()) {
        newErrors.gmailRetiro = 'El Gmail es obligatorio';
      } else if (!emailRegex.test(gmailRetiro)) {
        newErrors.gmailRetiro = 'Ingresa un Gmail válido';
      }
    } else if (metodo === 'Retiro vía Andreani') {
      if (!nombreAndreani.trim()) newErrors.nombreAndreani = 'El nombre es obligatorio';
      if (!apellidoAndreani.trim()) newErrors.apellidoAndreani = 'El apellido es obligatorio';
      if (!dniAndreani.trim()) newErrors.dniAndreani = 'El DNI es obligatorio';
      if (!provinciaAndreani.trim()) newErrors.provinciaAndreani = 'La provincia es obligatoria';
      if (!localidadAndreani.trim()) newErrors.localidadAndreani = 'La localidad es obligatoria';
      if (!cpAndreani.trim()) newErrors.cpAndreani = 'El código postal es obligatorio';
      if (!telAndreani.trim()) newErrors.telAndreani = 'El teléfono es obligatorio';
      if (!gmailAndreani.trim()) {
        newErrors.gmailAndreani = 'El Gmail es obligatorio';
      } else if (!emailRegex.test(gmailAndreani)) {
        newErrors.gmailAndreani = 'Ingresa un Gmail válido';
      }
    } else {
      // Envío a domicilio
      if (!nombreDom.trim()) newErrors.nombreDom = 'El nombre del destinatario es obligatorio';
      if (!direccionDom.trim()) newErrors.direccionDom = 'La dirección es obligatoria';
      if (!localidadDom.trim()) newErrors.localidadDom = 'La localidad es obligatoria';
      if (!cpDom.trim()) newErrors.cpDom = 'El código postal es obligatorio';
      if (!telDom.trim()) newErrors.telDom = 'El teléfono es obligatorio';
      if (!gmailDom.trim()) {
        newErrors.gmailDom = 'El Gmail es obligatorio';
      } else if (!emailRegex.test(gmailDom)) {
        newErrors.gmailDom = 'Ingresa un Gmail válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    let payload: any = {
      cliente: '',
      gmail: '',
      telefono: '',
      metodoEntrega: metodo,
      datosEntrega: {}
    };

    if (metodo === 'Retiro en tienda') {
      payload.cliente = nombreRetiro;
      payload.gmail = gmailRetiro;
      payload.telefono = telRetiro;
      payload.datosEntrega = {
        nombre: nombreRetiro
      };
    } else if (metodo === 'Retiro vía Andreani') {
      payload.cliente = `${nombreAndreani} ${apellidoAndreani}`;
      payload.gmail = gmailAndreani;
      payload.telefono = telAndreani;
      payload.datosEntrega = {
        nombre: nombreAndreani,
        apellido: apellidoAndreani,
        dni: dniAndreani,
        provincia: provinciaAndreani,
        localidad: localidadAndreani,
        cp: cpAndreani,
        sucursal: sucursalAndreani || 'Sucursal Estándar',
        telefono: telAndreani,
        gmail: gmailAndreani
      };
    } else {
      payload.cliente = nombreDom;
      payload.gmail = gmailDom;
      payload.telefono = telDom;
      payload.datosEntrega = {
        direccion: direccionDom,
        pisoDepto: pisoDom,
        localidad: localidadDom,
        cp: cpDom,
        telefono: telDom,
        gmail: gmailDom,
        comentarios: comentarioDom
      };
    }

    // Keep draft saved so user details remain populated if they return or add more items
    const currentDraft = {
      metodo,
      nombreRetiro,
      gmailRetiro,
      telRetiro,
      nombreAndreani,
      apellidoAndreani,
      dniAndreani,
      provinciaAndreani,
      localidadAndreani,
      cpAndreani,
      sucursalAndreani,
      telAndreani,
      gmailAndreani,
      nombreDom,
      direccionDom,
      pisoDom,
      localidadDom,
      cpDom,
      telDom,
      gmailDom,
      comentarioDom
    };
    localStorage.setItem('VIOLETA_CHECKOUT_DRAFT', JSON.stringify(currentDraft));
    onSubmit(payload);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Back to store navigation & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-bold text-brand-deep hover:text-brand-primary group transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs hover:border-brand-primary/40 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-brand-primary" />
          Volver a la tienda para sumar más prendas
        </button>

        <span className="text-[11px] font-mono text-brand-deep/70 bg-brand-light/40 px-3 py-1.5 rounded-lg border border-brand-light font-medium">
          🛒 Carrito guardado: <strong>{cartItems.reduce((a, b) => a + b.cantidad, 0)} items</strong> ({formatearPrecio(calcularTotal())})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (8 cols on desktop) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-gray-100 p-6 md:p-8 shadow-sm">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep tracking-tight mb-2 uppercase">
            ¿Cómo entregamos tu compra?
          </h2>
          <p className="text-xs sm:text-sm text-brand-deep/60 font-light mb-8 leading-relaxed">
            Selecciona tu método de entrega preferido y completa tus datos de contacto para coordinar y enviarte el recibo por mail.
          </p>

          {/* Delivery Method Selection Tabs */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-8">
            <button
              onClick={() => { setMetodo('Retiro en tienda'); setErrors({}); }}
              className={`p-2.5 sm:p-4 rounded-md border flex flex-col items-center text-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                metodo === 'Retiro en tienda'
                  ? 'bg-[#faf9f6] border-brand-primary text-brand-primary shadow-sm scale-[1.01] font-semibold'
                  : 'border-gray-200 bg-white text-brand-deep/75 hover:border-brand-primary hover:text-brand-primary'
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider leading-tight">Retiro en Tienda</span>
            </button>

            <button
              onClick={() => { setMetodo('Retiro vía Andreani'); setErrors({}); }}
              className={`p-2.5 sm:p-4 rounded-md border flex flex-col items-center text-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                metodo === 'Retiro vía Andreani'
                  ? 'bg-[#faf9f6] border-brand-primary text-brand-primary shadow-sm scale-[1.01] font-semibold'
                  : 'border-gray-200 bg-white text-[#5c5b57] hover:border-brand-primary hover:text-brand-primary'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider leading-tight">Sucursal Andreani</span>
            </button>

            <button
              onClick={() => { setMetodo('Envío a domicilio'); setErrors({}); }}
              className={`p-2.5 sm:p-4 rounded-md border flex flex-col items-center text-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                metodo === 'Envío a domicilio'
                  ? 'bg-[#faf9f6] border-brand-primary text-brand-primary shadow-sm scale-[1.01] font-semibold'
                  : 'border-gray-200 bg-white text-[#5c5b57] hover:border-brand-primary hover:text-brand-primary'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider leading-tight">A Domicilio</span>
            </button>
          </div>

          {/* Checkout Form Container */}
          <form onSubmit={handleConfirmar} className="space-y-6">
            
            {/* METHOD: Retiro en Tienda */}
            {metodo === 'Retiro en tienda' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-purple-50 text-brand-primary rounded-2xl border border-brand-light flex items-start gap-3 mb-4">
                  <Store className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold">Punto de Retiro Central</h4>
                    <p className="text-xs font-light text-brand-deep/75 mt-0.5">
                      Teniente Berdina, Barceló nro 9 - Tucumán. Atención 24/7. Una vez confirmado, puedes retirar de inmediato de forma gratuita.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Nombre completo de quien retira *</label>
                    <input
                      type="text"
                      placeholder="Ej: Sofía Martínez"
                      value={nombreRetiro}
                      onChange={(e) => setNombreRetiro(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.nombreRetiro ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.nombreRetiro && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.nombreRetiro}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Teléfono Celular *</label>
                    <input
                      type="tel"
                      placeholder="Ej: 3814567890"
                      value={telRetiro}
                      onChange={(e) => setTelRetiro(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.telRetiro ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.telRetiro && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.telRetiro}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Gmail de contacto * (Para enviar recibo)</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Ej: sofiamartinez@gmail.com"
                      value={gmailRetiro}
                      onChange={(e) => setGmailRetiro(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.gmailRetiro ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-deep/30" />
                  </div>
                  {errors.gmailRetiro && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.gmailRetiro}</p>}
                </div>
              </motion.div>
            )}

            {/* METHOD: Retiro vía Andreani */}
            {metodo === 'Retiro vía Andreani' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-purple-50 text-brand-primary rounded-2xl border border-brand-light flex items-start gap-3 mb-4">
                  <Truck className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold">Envío a Sucursal Oficial Andreani</h4>
                    <p className="text-xs font-light text-brand-deep/75 mt-0.5">
                      Despachamos en 24hs hábiles. Podrás retirar tu paquete presentando tu DNI y el código de seguimiento correspondiente.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Nombre *</label>
                    <input
                      type="text"
                      placeholder="Ej: Sofía"
                      value={nombreAndreani}
                      onChange={(e) => setNombreAndreani(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.nombreAndreani ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.nombreAndreani && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.nombreAndreani}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Apellido *</label>
                    <input
                      type="text"
                      placeholder="Ej: Martínez"
                      value={apellidoAndreani}
                      onChange={(e) => setApellidoAndreani(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.apellidoAndreani ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.apellidoAndreani && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.apellidoAndreani}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">DNI del destinatario *</label>
                    <input
                      type="text"
                      placeholder="Ej: 38123456"
                      value={dniAndreani}
                      onChange={(e) => setDniAndreani(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.dniAndreani ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.dniAndreani && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.dniAndreani}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Provincia *</label>
                    <input
                      type="text"
                      placeholder="Ej: Tucumán"
                      value={provinciaAndreani}
                      onChange={(e) => setProvinciaAndreani(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.provinciaAndreani ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.provinciaAndreani && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.provinciaAndreani}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Localidad *</label>
                    <input
                      type="text"
                      placeholder="Ej: San Miguel de Tucumán"
                      value={localidadAndreani}
                      onChange={(e) => setLocalidadAndreani(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.localidadAndreani ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.localidadAndreani && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.localidadAndreani}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Código Postal *</label>
                    <input
                      type="text"
                      placeholder="Ej: 4000"
                      value={cpAndreani}
                      onChange={(e) => setCpAndreani(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.cpAndreani ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.cpAndreani && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.cpAndreani}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Sucursal Andreani (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Sucursal San Miguel de Tucumán (25 de Mayo 540) o dejar en blanco para Sucursal más cercana"
                    value={sucursalAndreani}
                    onChange={(e) => setSucursalAndreani(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-light bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Teléfono de contacto *</label>
                    <input
                      type="tel"
                      placeholder="Ej: 3814567890"
                      value={telAndreani}
                      onChange={(e) => setTelAndreani(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.telAndreani ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.telAndreani && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.telAndreani}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Gmail de contacto * (Para enviar recibo)</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Ej: sofiamartinez@gmail.com"
                        value={gmailAndreani}
                        onChange={(e) => setGmailAndreani(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                          errors.gmailAndreani ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                        }`}
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-deep/30" />
                    </div>
                    {errors.gmailAndreani && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.gmailAndreani}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* METHOD: Envío a Domicilio */}
            {metodo === 'Envío a domicilio' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-purple-50 text-brand-primary rounded-2xl border border-brand-light flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold">Envío Directo a tu Domicilio</h4>
                    <p className="text-xs font-light text-brand-deep/75 mt-0.5">
                      Enviamos a través de mensajería privada o correo de confianza directo a la puerta de tu casa. El costo de despacho se coordinará por WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Nombre completo del destinatario *</label>
                    <input
                      type="text"
                      placeholder="Ej: Sofía Martínez"
                      value={nombreDom}
                      onChange={(e) => setNombreDom(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.nombreDom ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.nombreDom && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.nombreDom}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Dirección Completa (Calle y Altura) *</label>
                    <input
                      type="text"
                      placeholder="Ej: Av. Mate de Luna 1850"
                      value={direccionDom}
                      onChange={(e) => setDireccionDom(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.direccionDom ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.direccionDom && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.direccionDom}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Piso / Depto (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: 3ro B"
                      value={pisoDom}
                      onChange={(e) => setPisoDom(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-light bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Localidad *</label>
                    <input
                      type="text"
                      placeholder="Ej: Yerba Buena, Tucumán"
                      value={localidadDom}
                      onChange={(e) => setLocalidadDom(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.localidadDom ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.localidadDom && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.localidadDom}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Código Postal *</label>
                    <input
                      type="text"
                      placeholder="Ej: 4000"
                      value={cpDom}
                      onChange={(e) => setCpDom(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.cpDom ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.cpDom && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.cpDom}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Teléfono de contacto *</label>
                    <input
                      type="tel"
                      placeholder="Ej: 3814567890"
                      value={telDom}
                      onChange={(e) => setTelDom(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                        errors.telDom ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                      }`}
                    />
                    {errors.telDom && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.telDom}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Gmail de contacto * (Para enviar recibo)</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Ej: sofiamartinez@gmail.com"
                        value={gmailDom}
                        onChange={(e) => setGmailDom(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm ${
                          errors.gmailDom ? 'border-rose-400 focus:ring-rose-500' : 'border-brand-light'
                        }`}
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-deep/30" />
                    </div>
                    {errors.gmailDom && <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.gmailDom}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep/75 uppercase mb-2">Comentarios para el cartero (Opcional)</label>
                  <textarea
                    placeholder="Ej: Tocar timbre 'Martínez' o dejar con el encargado de seguridad."
                    value={comentarioDom}
                    onChange={(e) => setComentarioDom(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-brand-light bg-brand-light/20 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Confirm Purchase Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-brand hover:bg-gradient-brand-hover text-white font-display font-bold tracking-wider text-sm shadow-lg shadow-brand-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registrando Pedido en Google Sheets...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Confirmar Entrega y Avanzar al Pago
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Column: Order Summary (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-[#faf9f6] border border-gray-100 rounded-lg p-6 shadow-sm">
          <h3 className="font-display font-bold text-base text-brand-deep mb-4 pb-3 border-b border-gray-200 uppercase tracking-wide">
            Resumen del pedido
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto mb-6 pr-1">
            {cartItems.map((item) => (
              <div key={item.idUnica} className="flex gap-3 text-sm">
                <div className="w-12 h-15 rounded-md overflow-hidden shrink-0 border border-gray-200 bg-white">
                  <img src={item.producto.urlsImagenes[0]} alt={item.producto.nombre} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-brand-deep text-xs truncate">{item.producto.nombre}</h4>
                  <p className="text-[10px] text-brand-deep/50 mt-0.5 font-mono">Talle: {item.talle} | Cant: {item.cantidad}</p>
                  <p className="font-mono text-xs text-brand-dark font-bold mt-1">{formatearPrecio(item.producto.precio * item.cantidad)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-brand-deep/60">
              <span>Subtotal prendas</span>
              <span className="font-mono">{formatearPrecio(calcularTotal())}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-brand-deep/60">
              <span>Costo de envío</span>
              <span className="font-mono text-[9px] bg-white text-brand-primary px-2 py-0.5 rounded-sm border border-brand-primary/10 font-bold tracking-widest">A COORDINAR</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-deep font-bold">Total a pagar</span>
              <span className="font-mono text-brand-dark text-lg font-bold">{formatearPrecio(calcularTotal())}</span>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-gray-100 rounded-lg flex gap-2.5 items-start shadow-sm">
            <CreditCard className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-brand-deep/70">
              <strong>Forma de Pago:</strong> Transferencia Bancaria (Alias). Podrás ver el alias y copiarlo en el paso final, luego de confirmar este formulario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
