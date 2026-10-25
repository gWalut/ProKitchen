import React, { createContext, useContext, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';

interface ToastContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const showSuccess = useCallback((message: string) => {
        toast.success(message, {
            style: {
                background: '#10B981',
                color: '#FFFFFF',
            },
            iconTheme: {
                primary: '#FFFFFF',
                secondary: '#10B981',
            },
        });
    }, []);

    const showError = useCallback((message: string) => {
        toast.error(message, {
            style: {
                background: '#EF4444',
                color: '#FFFFFF',
            },
            iconTheme: {
                primary: '#FFFFFF',
                secondary: '#EF4444',
            },
        });
    }, []);

    return (
        <ToastContext.Provider value={{ showSuccess, showError }}>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                }}
            />
        </ToastContext.Provider>
    );
};

export default ToastProvider;