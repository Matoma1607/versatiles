import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Phone, ShieldCheck, Mail, Download, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import { WHATSAPP_NUMERO, ALIAS_TRANSFERENCIA, NOMBRE_MARCA } from '../config';
import { ItemCarrito, MetodoEntrega } from '../types';

interface SuccessScreenProps {
  idPedido: string;
  cliente: string;
  gmail: string;
  telefono: string;
  metodoEntrega: MetodoEntrega;
  datosEntrega: any;
  cartItems: ItemCarrito[];
  total: number;
  onReset: () => void;
  onBackToStore?: () => void;
}

export default function SuccessScreen({
  idPedido,
  cliente,
  gmail,
  telefono,
  metodoEntrega,
  datosEntrega,
  cartItems,
  total,
  onReset,
  onBackToStore
}: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(valor);
  };

  // Generador de Recibo en PDF de alta calidad
  const handleDownloadPDF = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 1. Estética general del documento: Barra superior bordó
      doc.setFillColor(131, 20, 68); // #831444
      doc.rect(0, 0, 210, 8, 'F');

      let currentY = 22;

      // 2. Encabezado - Nombre de la Marca y Título del Documento
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(17, 17, 17); // #111111
      doc.text('Versatile', 20, currentY);
      
      const brandWidth = doc.getTextWidth('Versatile');
      doc.setTextColor(131, 20, 68); // #831444
      doc.text('Shoop', 20 + brandWidth, currentY);

      // Título a la derecha
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(131, 20, 68);
      doc.text('COMPROBANTE DE COMPRA', 190, currentY - 2, { align: 'right' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(102, 102, 102);
      doc.text(`Documento No: ${idPedido}`, 190, currentY + 3, { align: 'right' });
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`, 190, currentY + 8, { align: 'right' });

      currentY += 15;

      // Línea divisoria elegante
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.4);
      doc.line(20, currentY, 190, currentY);

      currentY += 8;

      // 3. Bloque de Datos del Cliente e Información de Envío
      // Creamos una tarjeta gris/crema para el contenido
      doc.setFillColor(250, 249, 246); // #faf9f6
      doc.roundedRect(20, currentY, 170, 48, 2, 2, 'F');
      
      // Contorno fino
      doc.setDrawColor(234, 226, 230);
      doc.setLineWidth(0.2);
      doc.roundedRect(20, currentY, 170, 48, 2, 2, 'D');

      // Título de la tarjeta
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(131, 20, 68);
      doc.text('DETALLES DE LA ORDEN Y DESTINATARIO', 25, currentY + 8);

      // Datos del cliente (Izquierda)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(102, 102, 102);
      doc.text('CLIENTE:', 25, currentY + 16);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 17, 17);
      doc.text(cliente, 25, currentY + 21);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 102, 102);
      doc.text('GMAIL:', 25, currentY + 28);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 17, 17);
      doc.text(gmail, 25, currentY + 33);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 102, 102);
      doc.text('TELÉFONO:', 25, currentY + 40);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 17, 17);
      doc.text(telefono, 25, currentY + 45);

      // Datos de entrega (Derecha)
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 102, 102);
      doc.text('MÉTODO DE ENTREGA:', 105, currentY + 16);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 17, 17);
      doc.text(metodoEntrega, 105, currentY + 21);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 102, 102);
      doc.text('DIRECCIÓN / SUCURSAL DE ENTREGA:', 105, currentY + 28);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 17, 17);

      let detalleDireccion = '';
      if (metodoEntrega === 'Retiro en tienda') {
        detalleDireccion = 'Sucursal Tucumán (Teniente Berdina, Barceló nro 9 - Tucumán)';
      } else if (metodoEntrega === 'Retiro vía Andreani') {
        detalleDireccion = `Sucursal Andreani: ${datosEntrega.sucursal || 'Estándar'}\nLocalidad: ${datosEntrega.localidad || ''}, ${datosEntrega.provincia || ''}\nDNI: ${datosEntrega.dni || ''}`;
      } else {
        detalleDireccion = `${datosEntrega.direccion || ''} ${datosEntrega.pisoDepto || ''}\nLocalidad: ${datosEntrega.localidad || ''} (C.P: ${datosEntrega.cp || ''})`;
      }

      const splitDireccion = doc.splitTextToSize(detalleDireccion, 80);
      doc.text(splitDireccion, 105, currentY + 33);

      currentY += 58;

      // 4. Detalle de Productos
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(131, 20, 68);
      doc.text('RESUMEN DE ARTÍCULOS', 20, currentY);

      currentY += 4;

      // Tabla: Encabezado
      doc.setFillColor(131, 20, 68); // fondo de cabecera bordó
      doc.rect(20, currentY, 170, 7.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('Artículo / Prenda', 24, currentY + 5);
      doc.text('Talle', 115, currentY + 5, { align: 'center' });
      doc.text('Cant.', 135, currentY + 5, { align: 'center' });
      doc.text('Precio Unit.', 158, currentY + 5, { align: 'right' });
      doc.text('Subtotal', 186, currentY + 5, { align: 'right' });

      currentY += 7.5;

      // Tabla: Filas de productos
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      cartItems.forEach((item, index) => {
        // Alternar color de fila para legibilidad
        if (index % 2 === 1) {
          doc.setFillColor(248, 247, 245);
          doc.rect(20, currentY, 170, 8.5, 'F');
        }

        // Borde inferior fino
        doc.setDrawColor(240, 238, 235);
        doc.setLineWidth(0.15);
        doc.line(20, currentY + 8.5, 190, currentY + 8.5);

        doc.setTextColor(17, 17, 17);
        
        // Truncar nombre largo si es necesario
        const nombreProducto = item.producto.nombre;
        const nombreTruncado = nombreProducto.length > 50 ? nombreProducto.slice(0, 47) + '...' : nombreProducto;
        doc.text(nombreTruncado, 24, currentY + 5.5);

        // Talle
        doc.text(String(item.talle), 115, currentY + 5.5, { align: 'center' });

        // Cantidad
        doc.text(String(item.cantidad), 135, currentY + 5.5, { align: 'center' });

        // Precio unitario
        doc.text(formatearPrecio(item.producto.precio), 158, currentY + 5.5, { align: 'right' });

        // Subtotal item
        doc.text(formatearPrecio(item.producto.precio * item.cantidad), 186, currentY + 5.5, { align: 'right' });

        currentY += 8.5;
      });

      // 5. Total
      currentY += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(131, 20, 68);
      doc.text('TOTAL GENERAL:', 135, currentY + 5, { align: 'right' });
      doc.setFontSize(12);
      doc.text(formatearPrecio(total), 186, currentY + 5, { align: 'right' });

      currentY += 15;

      // 6. Próximos pasos e información de pago
      doc.setFillColor(254, 242, 242); // Fondo rosa suave de atención
      doc.roundedRect(20, currentY, 170, 24, 2, 2, 'F');
      
      doc.setDrawColor(248, 113, 113); // Borde rojo claro
      doc.setLineWidth(0.2);
      doc.roundedRect(20, currentY, 170, 24, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(131, 20, 68);
      doc.text('⚠️ IMPORTANTE: PASO REQUERIDO PARA VALIDAR EL PAGO', 24, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(80, 20, 40);
      doc.text(`1. Realice la transferencia correspondiente por ${formatearPrecio(total)} al Alias de Mercado Pago: "${ALIAS_TRANSFERENCIA}".`, 24, currentY + 12);
      doc.text('2. Envíe una captura de pantalla del comprobante de transferencia y este PDF adjunto al chat de WhatsApp para su empaque.', 24, currentY + 18);

      // 7. Pie de página
      currentY = 272; // Fijado cerca del fondo A4 (297mm de alto)
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.4);
      doc.line(20, currentY, 190, currentY);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text('Gracias por elegir VersatileShoop Indumentaria. Tu estilo, nuestra pasión.', 105, currentY + 5, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.text('Este documento es una copia digital oficial generada de manera automática por nuestra plataforma web.', 105, currentY + 9, { align: 'center' });

      // Guardar PDF
      doc.save(`Recibo_Versatile_${idPedido}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un inconveniente al generar el PDF. Por favor, toma una captura de pantalla de esta pantalla.');
    }
  };

  // Construir el mensaje de WhatsApp para enviar
  const generarMensajeWhatsApp = () => {
    let msg = `🛍️ *${NOMBRE_MARCA} - NUEVO PEDIDO*\n`;
    msg += `_ID del Pedido: ${idPedido}_\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    msg += `👤 *DATOS DEL CLIENTE*\n`;
    msg += `• *Nombre:* ${cliente}\n`;
    msg += `• *Gmail:* ${gmail}\n`;
    msg += `• *Teléfono:* ${telefono}\n\n`;
    
    msg += `📦 *DETALLES DE ENTREGA*\n`;
    msg += `• *Método:* ${metodoEntrega}\n`;

    if (metodoEntrega === 'Retiro en tienda') {
      msg += `• *Lugar de Retiro:* Sucursal Tucumán (Teniente Berdina, Barceló nro 9 - Tucumán)\n`;
    } else if (metodoEntrega === 'Retiro vía Andreani') {
      msg += `• *Sucursal Andreani:* ${datosEntrega.sucursal || 'Estándar'}\n`;
      msg += `• *Localidad:* ${datosEntrega.localidad}, ${datosEntrega.provincia}\n`;
      msg += `• *Código Postal:* ${datosEntrega.cp}\n`;
      msg += `• *DNI de Retiro:* ${datosEntrega.dni}\n`;
    } else {
      msg += `• *Dirección:* ${datosEntrega.direccion} ${datosEntrega.pisoDepto || ''}\n`;
      msg += `• *Localidad:* ${datosEntrega.localidad}\n`;
      msg += `• *Código Postal:* ${datosEntrega.cp}\n`;
      if (datosEntrega.comentarios) {
        msg += `• *Comentario:* ${datosEntrega.comentarios}\n`;
      }
    }
    
    msg += `\n🛒 *DETALLE DEL PEDIDO*\n`;
    cartItems.forEach((item) => {
      msg += `• ${item.cantidad}x ${item.producto.nombre} (Talle: ${item.talle}) - *${formatearPrecio(item.producto.precio * item.cantidad)}*\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `💳 *INFORMACIÓN DE PAGO*\n`;
    msg += `• *Total a Transferir:* *${formatearPrecio(total)}*\n`;
    msg += `• *Método:* Transferencia Bancaria\n`;
    msg += `• *Alias Mercado Pago:* *${ALIAS_TRANSFERENCIA}*\n\n`;
    msg += `_¡Ya descargué mi recibo en PDF y en breve enviaré el comprobante de pago por este medio!_`;

    return encodeURIComponent(msg);
  };

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(ALIAS_TRANSFERENCIA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppRedirect = () => {
    const textoCompleto = generarMensajeWhatsApp();
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${textoCompleto}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center">
      
      {/* Top back button */}
      {onBackToStore && (
        <div className="flex justify-start mb-6">
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-brand-deep hover:border-brand-primary/50 text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-brand-primary" />
            <span>Volver a la Tienda / Carrito</span>
          </button>
        </div>
      )}

      {/* Dynamic Animated Success Check Ring */}
      <div className="mb-8 flex justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 120 }}
          className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 relative"
        >
          <Check className="w-10 h-10 stroke-[3]" />
          <span className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-20"></span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-deep tracking-tight mb-2">
          ¡Pedido Registrado con Éxito!
        </h2>
        <p className="text-sm font-mono text-brand-primary tracking-wider uppercase font-bold mb-6">
          NÚMERO DE PEDIDO: {idPedido}
        </p>

        {/* PDF Download and confirmation notice */}
        <div className="p-5 bg-brand-light/70 rounded-3xl border border-brand-medium/20 flex flex-col gap-4 text-left max-w-lg mx-auto mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-xl shrink-0 mt-0.5">
              <FileText className="w-5.5 h-5.5 text-brand-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-sm text-brand-deep">Recibo Digital Listo</h4>
              <p className="text-xs text-brand-deep/70 leading-relaxed font-light mt-1">
                Para tu tranquilidad y comodidad, ya puedes descargar tu **recibo oficial de compra en PDF** directamente a tu dispositivo para enviarlo junto con tu comprobante de pago.
              </p>
            </div>
          </div>

          {/* Action button to download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-brand hover:bg-gradient-brand-hover text-white font-display font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            Descargar Recibo en PDF
          </button>
        </div>

        {/* Step-by-Step Actions */}
        <div className="space-y-6 text-left max-w-lg mx-auto bg-white border border-brand-light p-6 sm:p-8 rounded-3xl shadow-sm mb-8">
          
          <h3 className="font-display font-bold text-lg text-brand-deep pb-3 border-b border-brand-light mb-4">
            Siguientes Pasos para completarlo:
          </h3>

          {/* STEP 1: WhatsApp notification */}
          <div className="flex gap-4 items-start">
            <span className="w-7 h-7 rounded-full bg-brand-light text-brand-primary font-display font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-brand-deep">Envía el pedido por WhatsApp</h4>
              <p className="text-xs text-brand-deep/60 font-light mt-1 mb-3">
                Presiona el botón de abajo para enviar el resumen autogenerado a nuestro WhatsApp comercial. Así sabremos que estás listo.
              </p>
              
              <button
                onClick={handleWhatsAppRedirect}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Phone className="w-4.5 h-4.5" />
                Enviar Pedido por WhatsApp
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STEP 2: Bank transfer */}
          <div className="flex gap-4 items-start pt-6 border-t border-brand-light">
            <span className="w-7 h-7 rounded-full bg-brand-light text-brand-primary font-display font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-brand-deep">Realiza la transferencia</h4>
              <p className="text-xs text-brand-deep/60 font-light mt-1 mb-3">
                Transfiere el total correspondiente a nuestro Alias de Mercado Pago / Banco.
              </p>

              <div className="bg-brand-light/40 border border-brand-light rounded-2xl p-4 flex flex-col items-center sm:flex-row sm:justify-between gap-3 text-center sm:text-left">
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-brand-deep/40 uppercase">ALIAS DE TRANSFERENCIA</span>
                  <p className="font-mono text-base font-extrabold text-brand-primary mt-0.5">{ALIAS_TRANSFERENCIA}</p>
                </div>
                
                <button
                  onClick={handleCopyAlias}
                  className={`px-4 py-2.5 rounded-xl border font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    copied 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                      : 'bg-white border-brand-medium/30 text-brand-primary hover:bg-brand-light'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Alias
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 flex justify-between text-xs font-semibold text-brand-deep">
                <span>Total prendas a transferir:</span>
                <span className="text-brand-primary font-display font-bold text-sm">{formatearPrecio(total)}</span>
              </div>
            </div>
          </div>

          {/* STEP 3: Dispatch */}
          <div className="flex gap-4 items-start pt-6 border-t border-brand-light">
            <span className="w-7 h-7 rounded-full bg-brand-light text-brand-primary font-display font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-brand-deep">Adjunta el comprobante</h4>
              <p className="text-xs text-brand-deep/60 font-light mt-1">
                Una vez realizada la transferencia, toma una captura de pantalla y envíala por el mismo chat de WhatsApp. ¡Despachamos tu compra de inmediato!
              </p>
            </div>
          </div>

        </div>

        {/* Security / trust badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-brand-deep/40 font-mono mb-8">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          TRANSACCIÓN SEGURA Y VERIFICADA
        </div>

        {/* Go back / reset buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border-2 border-brand-primary text-brand-primary font-display font-bold text-xs uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la Tienda (Conservar Pedido)
            </button>
          )}

          <button
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gray-100 border border-gray-200 text-brand-deep/70 hover:bg-gray-200 hover:text-brand-deep font-display font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            Nueva Compra (Vaciar Carrito)
          </button>
        </div>

      </motion.div>

    </div>
  );
}
