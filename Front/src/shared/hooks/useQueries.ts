import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '../api/apiClient';

// Ключи запросов
export const queryKeys = {
    ingredients: 'ingredients',
    favorites: 'favorites',
    profile: 'profile'
} as const;

// Функции получения данных
const fetchIngredients = async () => {
    const { data } = await apiClient.get('/api/ingredients/list');
    return data;
};

const fetchFavorites = async () => {
    const { data } = await apiClient.get('/api/favorites');
    return data;
};

const fetchProfile = async () => {
    const { data } = await apiClient.get('/api/profile');
    return data;
};

// Хук для предзагрузки критичных данных
export const usePrefetchData = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Предзагрузка списка ингредиентов
        queryClient.prefetchQuery({
            queryKey: [queryKeys.ingredients],
            queryFn: fetchIngredients,
            staleTime: 5 * 60 * 1000 // Кэшируем на 5 минут
        });

        // Если пользователь авторизован, предзагружаем избранное
        if (localStorage.getItem('token')) {
            queryClient.prefetchQuery({
                queryKey: [queryKeys.favorites],
                queryFn: fetchFavorites
            });
        }
    }, [queryClient]);
};

// Хук для получения списка ингредиентов
export const useIngredients = () => {
    return useQuery({
        queryKey: [queryKeys.ingredients],
        queryFn: fetchIngredients,
        staleTime: 5 * 60 * 1000
    });
};

// Хук для получения избранного
export const useFavorites = () => {
    return useQuery({
        queryKey: [queryKeys.favorites],
        queryFn: fetchFavorites
    });
};

// Хук для получения профиля
export const useProfile = () => {
    return useQuery({
        queryKey: [queryKeys.profile],
        queryFn: fetchProfile
    });
};