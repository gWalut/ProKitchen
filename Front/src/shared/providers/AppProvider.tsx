import { Toaster } from 'react-hot-toast';

interface AppProviderProps {
    children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--toast-background)',
                        color: 'var(--toast-foreground)'
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--success)',
                            secondary: 'white'
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: 'var(--error)',
                            secondary: 'white'
                        }
                    }
                }}
            />
        </>
    );
};