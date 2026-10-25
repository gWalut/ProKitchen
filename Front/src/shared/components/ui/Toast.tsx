import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    onDismiss: (id: string) => void;
    duration?: number;
}

export const Toast = ({
    id,
    type,
    message,
    onDismiss,
    duration = 5000
}: ToastProps) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onDismiss(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, id, onDismiss]);

    const styles = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200'
    };

    return (
        <div
            className={`
        flex items-center justify-between p-4 mb-3 rounded-lg border
        ${styles[type]}
        animate-enter
      `}
            role="alert"
        >
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={() => onDismiss(id)}
                className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
                <span className="sr-only">Закрыть</span>
                <XMarkIcon className="h-5 w-5" />
            </button>
        </div>
    );
};