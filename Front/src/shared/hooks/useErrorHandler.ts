import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export const useErrorHandler = () => {
    const handleError = useCallback((error: unknown) => {
        if (error instanceof AxiosError) {
            const data = error.response?.data as ApiError | undefined;

            if (data?.message) {
                toast.error(data.message);
            } else if (data?.errors) {
                // Показываем первую ошибку из списка
                const firstError = Object.values(data.errors)[0]?.[0];
                if (firstError) {
                    toast.error(firstError);
                }
            } else {
                toast.error('Произошла ошибка при выполнении запроса');
            }
        } else if (error instanceof Error) {
            toast.error(error.message);
        } else {
            toast.error('Произошла неизвестная ошибка');
        }
    }, []);

    return { handleError };
};