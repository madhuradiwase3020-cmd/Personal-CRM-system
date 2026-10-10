import { createContext, useCallback, useContext, useState } from 'react';
import { Check, CircleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(items => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts(items => items.filter(item => item.id !== id)), 3800);
  }, []);
  return <ToastContext.Provider value={toast}>
    {children}
    <div className="toast-stack" aria-live="polite">
      {toasts.map(item => <div className={`toast toast-${item.type}`} key={item.id}>
        {item.type === 'success' ? <Check size={17} /> : <CircleAlert size={17} />}
        <span>{item.message}</span>
        <button aria-label="Dismiss notification" onClick={() => setToasts(items => items.filter(toastItem => toastItem.id !== item.id))}><X size={15} /></button>
      </div>)}
    </div>
  </ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
