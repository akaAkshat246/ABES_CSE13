import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-32 left-1/2 z-[100] pointer-events-none"
        >
          <div className={cn(
            "flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl border backdrop-blur-md min-w-[280px] pointer-events-auto",
            type === 'success' && "bg-[var(--primary)] text-white border-[var(--primary)]/20",
            type === 'error' && "bg-rose-500 text-white border-rose-400/20",
            type === 'info' && "glass text-[var(--text-primary)] border-[var(--border)]"
          )}>
            {type === 'success' && <CheckCircle2 size={18} strokeWidth={2} />}
            {type === 'error' && <AlertCircle size={18} strokeWidth={2} />}
            <span className="caption-text font-bold uppercase tracking-widest flex-1">{message}</span>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
