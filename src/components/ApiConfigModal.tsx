import { useState } from 'react';
import { X, Check, Save, Link, HelpCircle, Code, ListFilter, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedUrl: string;
  onSaveUrl: (url: string) => void;
}

export default function ApiConfigModal({ isOpen, onClose, savedUrl, onSaveUrl }: ApiConfigModalProps) {
  const [urlInput, setUrlInput] = useState(savedUrl);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'tutorial'>('config');

  const handleSave = () => {
    onSaveUrl(urlInput.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-deep/80 backdrop-blur-sm"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-light flex items-center justify-between bg-brand-light/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-brand-deep">Configuración Backend</h3>
                  <p className="text-[10px] font-mono text-brand-primary tracking-wider uppercase">Google Sheets + Google Apps Script</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-brand-light text-brand-deep transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-brand-light px-6 bg-brand-light/10">
              <button
                onClick={() => setActiveTab('config')}
                className={`py-3 px-4 font-display text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'config'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-brand-deep/50 hover:text-brand-deep'
                }`}
              >
                Conectar Planilla
              </button>
              <button
                onClick={() => setActiveTab('tutorial')}
                className={`py-3 px-4 font-display text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'tutorial'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-brand-deep/50 hover:text-brand-deep'
                }`}
              >
                Instrucciones de Despliegue (3 Pasos)
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB: Conectar Planilla */}
              {activeTab === 'config' && (
                <div className="space-y-6">
                  
                  {/* URL Input Form */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold tracking-wider text-brand-deep uppercase">
                      URL de la Web App de Apps Script
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-brand-light bg-brand-light/10 text-brand-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm font-mono"
                      />
                      <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-deep/30" />
                    </div>
                    <p className="text-[11px] leading-relaxed text-brand-deep/50">
                      Pega la URL de tipo "exec" obtenida al implementar tu Apps Script como Web App. Si la dejas en blanco, el sitio usará el <strong>modo de simulación</strong> con catálogo demo pre-cargado para que puedas navegar libremente.
                    </p>
                  </div>

                  {/* Status checklist */}
                  <div className="bg-brand-light/30 border border-brand-light rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-mono font-bold tracking-wider text-brand-primary uppercase">Estructura requerida de las Hojas</h4>
                    <p className="text-[11px] text-brand-deep/70">
                      El Apps Script creará estas hojas automáticamente la primera vez que se ejecute. Si ya las tienes, asegúrate de mantener estas columnas en la fila 1:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px]">
                      <div className="p-3 bg-white rounded-xl border border-brand-light">
                        <span className="font-semibold text-brand-primary">1. Productos</span>
                        <p className="text-[10px] text-brand-deep/50 mt-1 font-mono leading-tight">
                          ID, Nombre, Precio, Talles disponibles, URLs de imágenes, Categoría, Stock
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-brand-light">
                        <span className="font-semibold text-brand-primary">2. Pedidos</span>
                        <p className="text-[10px] text-brand-deep/50 mt-1 font-mono leading-tight">
                          Fecha, ID Pedido, Cliente, Gmail, Teléfono, Método Entrega, Datos Entrega, Productos, Total
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-brand-light">
                        <span className="font-semibold text-brand-primary">3. Galería</span>
                        <p className="text-[10px] text-brand-deep/50 mt-1 font-mono leading-tight">
                          ID, URL de imagen, Producto asociado (ID), Orden
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-brand-light">
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl border border-brand-light text-brand-deep/70 text-xs font-semibold hover:bg-brand-light cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2.5 rounded-xl bg-gradient-brand hover:bg-gradient-brand-hover text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Guardar Conexión
                    </button>
                  </div>

                </div>
              )}

              {/* TAB: Instrucciones de Despliegue */}
              {activeTab === 'tutorial' && (
                <div className="space-y-5 text-sm leading-relaxed text-brand-deep/80 font-light">
                  
                  {/* Step 1 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="w-6 h-6 rounded-full bg-brand-primary text-white font-display font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-brand-deep text-sm">Crea tu Planilla y abre el Editor</h4>
                      <p className="text-xs text-brand-deep/70 mt-0.5">
                        Crea un Google Sheet en tu Google Drive. En el menú superior, ve a <strong>Extensiones</strong> &gt; <strong>Apps Script</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="w-6 h-6 rounded-full bg-brand-primary text-white font-display font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-brand-deep text-sm">Pega el archivo Code.gs</h4>
                      <p className="text-xs text-brand-deep/70 mt-0.5">
                        Borra cualquier código existente en el archivo <code>Código.gs</code> y pega el contenido completo del archivo <code>Code.gs</code> que hemos incluido en la raíz de este proyecto. Presiona guardar (icono de disquete).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3.5 items-start">
                    <span className="w-6 h-6 rounded-full bg-brand-primary text-white font-display font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold text-brand-deep text-sm">Despliega como Aplicación Web</h4>
                      <p className="text-xs text-brand-deep/70 mt-0.5">
                        Haz clic en <strong>Implementar</strong> (arriba a la derecha) &gt; <strong>Nueva implementación</strong>.<br />
                        • Tipo: <strong>Aplicación web</strong>.<br />
                        • Descripción: <code>Backend Tienda</code>.<br />
                        • Ejecutar como: <strong>Yo (tu correo)</strong>.<br />
                        • Quién tiene acceso: <strong>Cualquiera</strong> (esencial para que tus clientes registren compras).<br />
                        Haz clic en Implementar y autoriza los permisos requeridos para Sheets y Gmail. Copia la URL resultante (debe terminar en <code>/exec</code>) y pégala en la pestaña "Conectar Planilla".
                      </p>
                    </div>
                  </div>

                  {/* Mail authorization hint */}
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 flex gap-3 items-start mt-4">
                    <HelpCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      <strong>Nota de Seguridad:</strong> Google te mostrará una advertencia de "Aplicación no verificada" cuando autorices los permisos. Es normal para tus propios scripts. Haz clic en "Configuración avanzada" y luego en "Ir a Proyecto (no seguro)" para completar el flujo.
                    </p>
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
