import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'pink' | 'lavender' | 'mint';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#FFFCFB] border border-[#FFD9E2] rounded-2xl shadow-[0_10px_25px_rgba(255,182,193,0.35)] text-sm text-[#4A4450] font-semibold"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5277] shrink-0" />
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="关闭提示"
              className="p-1 text-[#8F8795] hover:text-[#4A4450] hover:bg-[#FFF0F3] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
