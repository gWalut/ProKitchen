import { AppRoutes } from '@/routes';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { ToastProvider } from '@/shared/providers/ToastProvider';
import { UIProvider } from '@/shared/contexts/UIContext';

function App() {
    return (
        <ThemeProvider>
            <UIProvider>
                <ToastProvider>
                    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500 ease-in-out">
                        <AppRoutes />
                    </div>
                </ToastProvider>
            </UIProvider>
        </ThemeProvider>
    );
}

export default App;