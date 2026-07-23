import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  const borderColors = { success: '#10B981', error: '#ef4444', info: '#3b82f6' };
  const iconColors = { success: '#10B981', error: '#ef4444', info: '#3b82f6' };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-card"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', minWidth: '300px',
              borderLeft: `4px solid ${borderColors[t.type]}`,
              animation: 'fadeSlideIn 0.3s ease-out'
            }}
          >
            {t.type === 'success' && <CheckCircle size={20} color={iconColors.success} />}
            {t.type === 'error' && <XCircle size={20} color={iconColors.error} />}
            {t.type === 'info' && <Info size={20} color={iconColors.info} />}
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
