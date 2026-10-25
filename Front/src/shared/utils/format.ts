import {
    format,
    parse,
    isValid,
    parseISO
} from 'date-fns';
import { ru } from 'date-fns/locale';

// Форматы
export const DATE_FORMAT = 'dd.MM.yyyy';
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

// Форматирование даты для отображения
export const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    return format(dateObj, DATE_FORMAT, { locale: ru });
};

// Форматирование даты и времени
export const formatDateTime = (date: Date | string | null | undefined): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    return format(dateObj, DATE_TIME_FORMAT, { locale: ru });
};

// Парсинг даты из строки в российском формате
export const parseDate = (dateStr: string): Date | null => {
    try {
        const date = parse(dateStr, DATE_FORMAT, new Date());
        return isValid(date) ? date : null;
    } catch {
        return null;
    }
};

// Конвертация даты в ISO формат для API
export const toISODate = (date: Date | null | undefined): string => {
    if (!date || !isValid(date)) return '';
    return format(date, ISO_DATE_FORMAT);
};

// Форматирование валюты
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(amount);
};

// Форматирование числа с разделителями
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU').format(num);
};

// Форматирование процентов
export const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value / 100);
};