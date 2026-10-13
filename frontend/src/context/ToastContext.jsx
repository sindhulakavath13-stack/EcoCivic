import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = (msg, dur) => addToast(msg, 'success', dur);
  const error = (msg, dur) => addToast(msg, 'error', dur || 5000);
  const warning = (msg, dur) => addToast(msg, 'warning', dur);
  const info = (msg, dur) => addToast(msg, 'info', dur);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        pointerEvents: 'none',
        maxWidth: '420px',
        width: 'calc(100% - 48px)'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card-solid)',
              border: `1px solid ${
                toast.type === 'success' ? 'rgba(16, 185, 129, 0.4)' :
                toast.type === 'error' ? 'rgba(244, 63, 94, 0.4)' :
                toast.type === 'warning' ? 'rgba(245, 158, 11, 0.4)' :
                'rgba(6, 182, 212, 0.4)'
              }`,
              boxShadow: 'var(--shadow-lg)',
              backdropFilter: 'blur(16px)',
              animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              color: 'var(--text-main)',
              fontSize: '0.92rem',
              fontWeight: 500
            }}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />}
            {toast.type === 'error' && <AlertCircle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />}
            {toast.type === 'warning' && <AlertTriangle size={20} color="var(--color-warning)" style={{ flexShrink: 0 }} />}
            {toast.type === 'info' && <Info size={20} color="var(--color-accent)" style={{ flexShrink: 0 }} />}
            <span style={{ flex: 1, wordBreak: 'break-word' }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 4
              }}
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
