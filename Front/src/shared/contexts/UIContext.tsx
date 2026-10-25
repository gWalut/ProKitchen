import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode
} from 'react';
import { Toast, ToastProps } from '@/shared/components/ui/Toast';

type Theme = 'light' | 'dark';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface UIContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('light');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <UIContext.Provider value={{ theme, setTheme, showToast }}>
            {children}
            <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        type={toast.type}
                        message={toast.message}
                        onDismiss={dismissToast}
                    />
                ))}
            </div>
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};