import { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Parche de protección DOM para evitar crasheos "NotFoundError: Failed to execute 'insertBefore' / 'removeChild'"
// provocados por traductores automáticos (Google Translate / Chrome) o extensiones del navegador
if (typeof window !== 'undefined' && typeof Node !== 'undefined' && Node.prototype) {
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console && console.warn) {
        console.warn('Protección React: insertBefore llamado con un nodo de referencia que no pertenece a este padre.', referenceNode, this);
      }
      return this.appendChild(newNode);
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child && child.parentNode !== this) {
      if (console && console.warn) {
        console.warn('Protección React: removeChild llamado con un nodo hijo que pertenece a otro padre.', child, this);
      }
      if (child.parentNode) {
        return child.parentNode.removeChild(child) as T;
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };
}

// Error Boundary para capturar cualquier fallo inesperado y evitar la pantalla blanca
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-neutral-200">
            <h2 className="font-display font-bold text-xl text-neutral-800 mb-2">Algo salió mal</h2>
            <p className="text-sm text-neutral-600 mb-6">
              Ocurrió un error inesperado al renderizar la página. Haz clic abajo para volver a cargar la aplicación.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-[#9861a4] hover:bg-[#865192] text-white font-bold rounded-xl shadow transition-all cursor-pointer"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

