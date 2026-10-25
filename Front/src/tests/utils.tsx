import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Создаем тестовый QueryClient
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

// Оборачиваем компонент в необходимые провайдеры
export function renderWithProviders(
    ui: React.ReactElement,
    { route = '/' } = {}
) {
    window.history.pushState({}, 'Test page', route);

    const queryClient = createTestQueryClient();

    return {
        user: userEvent.setup(),
        queryClient,
        ...rtlRender(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    {ui}
                </QueryClientProvider>
            </BrowserRouter>
        ),
    };
}

// Вспомогательные функции для тестирования форм
export const fillForm = async (user: ReturnType<typeof userEvent.setup>, fields: Record<string, string>) => {
    for (const [name, value] of Object.entries(fields)) {
        const input = document.querySelector(`[name="${name}"]`);
        if (input) {
            await user.type(input, value);
        }
    }
};