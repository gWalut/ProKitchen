import { screen, waitFor } from '@testing-library/react';
import { LoginForm } from '../components/LoginForm';
import { renderWithProviders } from './utils';

describe('LoginForm', () => {
    const mockSubmit = jest.fn();

    beforeEach(() => {
        mockSubmit.mockClear();
    });

    it('отображает ошибки валидации', async () => {
        const { user } = renderWithProviders(
            <LoginForm onSubmit={mockSubmit} />
        );

        // Отправляем пустую форму
        await user.click(screen.getByRole('button', { name: /войти/i }));

        // Проверяем отображение ошибок
        expect(await screen.findByText(/email обязателен/i)).toBeInTheDocument();
        expect(await screen.findByText(/пароль обязателен/i)).toBeInTheDocument();

        // Проверяем что форма не была отправлена
        expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('успешно отправляет форму с валидными данными', async () => {
        const { user } = renderWithProviders(
            <LoginForm onSubmit={mockSubmit} />
        );

        // Заполняем форму
        await user.type(
            screen.getByPlaceholderText(/email/i),
            'test@example.com'
        );
        await user.type(
            screen.getByPlaceholderText(/пароль/i),
            'password123'
        );

        // Отправляем форму
        await user.click(screen.getByRole('button', { name: /войти/i }));

        // Проверяем что форма была отправлена с правильными данными
        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            });
        });
    });

    it('отображает состояние загрузки при отправке', async () => {
        // Создаем промис для контроля асинхронной операции
        let resolveSubmit: (value: unknown) => void;
        const submitPromise = new Promise(resolve => {
            resolveSubmit = resolve;
        });

        const mockAsyncSubmit = jest.fn(() => submitPromise);

        const { user } = renderWithProviders(
            <LoginForm onSubmit={mockAsyncSubmit} />
        );

        // Заполняем и отправляем форму
        await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
        await user.type(screen.getByPlaceholderText(/пароль/i), 'password123');
        await user.click(screen.getByRole('button', { name: /войти/i }));

        // Проверяем состояние загрузки
        expect(screen.getByText(/вход.../i)).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();

        // Завершаем асинхронную операцию
        resolveSubmit!(undefined);
    });
});