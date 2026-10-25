import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date: Date): string => {
    return format(date, 'dd.MM.yyyy', { locale: ru });
};

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
    }).format(price);
};