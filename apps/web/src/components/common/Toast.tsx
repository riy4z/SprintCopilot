import { useEffect } from 'react';
import { useToast, type Toast, type ToastType } from '@/context/toastContext';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'check_circle',
          iconColor: 'text-green-500',
          textColor: 'text-green-900 dark:text-green-100',
          descColor: 'text-green-700 dark:text-green-200'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'error',
          iconColor: 'text-red-500',
          textColor: 'text-red-900 dark:text-red-100',
          descColor: 'text-red-700 dark:text-red-200'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          icon: 'warning',
          iconColor: 'text-amber-500',
          textColor: 'text-amber-900 dark:text-amber-100',
          descColor: 'text-amber-700 dark:text-amber-200'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'info',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-900 dark:text-blue-100',
          descColor: 'text-blue-700 dark:text-blue-200'
        };
    }
  };

  const styles = getToastStyles(toast.type);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`p-4 ${styles.bg} border ${styles.border} rounded-lg shadow-lg transform transition-all duration-300 ease-in-out mb-3 max-w-sm`}
    >
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined ${styles.iconColor} mt-0.5`}>
          {styles.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${styles.descColor} leading-relaxed`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className={`${styles.iconColor} hover:opacity-70 transition-opacity ml-2`}
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] pointer-events-none">
      <div className="flex flex-col pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </div>
  );
};