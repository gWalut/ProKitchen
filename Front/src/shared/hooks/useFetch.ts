import { useState, useCallback } from 'react';
import { useUI } from '@/shared/contexts/UIContext';

interface UseFetchOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

interface FetchState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}

export function useFetch<T>() {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        isLoading: false,
        error: null
    });

    const { showToast } = useUI();

    const execute = useCallback(
        async (
            promise: Promise<T>,
            { onSuccess, onError }: UseFetchOptions<T> = {}
        ) => {
            try {
                setState((prev) => ({ ...prev, isLoading: true, error: null }));
                const data = await promise;
                setState((prev) => ({ ...prev, data, isLoading: false }));
                onSuccess?.(data);
                return data;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Произошла ошибка');
                setState((prev) => ({ ...prev, error, isLoading: false }));
                onError?.(error);
                showToast('error', error.message);
                throw error;
            }
        },
        [showToast]
    );

    return {
        ...state,
        execute
    };
}