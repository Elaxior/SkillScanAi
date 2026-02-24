/**
 * Toast Notification Component
 * 
 * Simple toast system for success/error messages.
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = useCallback((
    type: ToastType,
    message: string,
    duration: number = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    
    // Auto remove
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// CONTAINER
// ============================================================================

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// TOAST ITEM
// ============================================================================

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };
  
  const colors: Record<ToastType, string> = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border
        backdrop-blur-lg shadow-lg cursor-pointer
        ${colors[toast.type]}
      `}
      onClick={onRemove}
    >
      <span className="text-lg">{icons[toast.type]}</span>
      <p className="text-sm text-white">{toast.message}</p>
    </motion.div>
  );
}

// ============================================================================
// SIMPLE TOAST FUNCTIONS
// ============================================================================

/**
 * Standalone toast function for use outside React
 * Uses a simple DOM-based approach
 */
export function showToast(type: ToastType, message: string, duration: number = 4000) {
  // Create container if doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm';
    document.body.appendChild(container);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  const colors: Record<ToastType, string> = {
    success: 'bg-green-500/90',
    error: 'bg-red-500/90',
    info: 'bg-blue-500/90',
    warning: 'bg-yellow-500/90',
  };
  
  toast.className = `
    flex items-center gap-3 px-4 py-3 rounded-lg text-white
    shadow-lg transform transition-all duration-300 translate-x-0
    ${colors[type]}
  `;
  toast.innerHTML = `<span>${message}</span>`;
  
  // Add to container
  container.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });
  
  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}