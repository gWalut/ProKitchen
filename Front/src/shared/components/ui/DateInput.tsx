import { useRef, useState } from 'react';
import { Input } from './Input';
import { formatDate, parseDate, toISODate } from '../../utils/format';

interface DateInputProps {
    value: string; // ISO date string
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
}

export const DateInput = ({
    value,
    onChange,
    error,
    placeholder = 'дд.мм.гггг',
    disabled,
    required,
    name
}: DateInputProps) => {
    // Форматированное значение для отображения
    const [displayValue, setDisplayValue] = useState(() => {
        if (!value) return '';
        try {
            return formatDate(value);
        } catch {
            return '';
        }
    });

    const lastValidValue = useRef(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDisplayValue = e.target.value;
        setDisplayValue(newDisplayValue);

        // Если поле пустое, отправляем пустую строку
        if (!newDisplayValue) {
            onChange('');
            lastValidValue.current = '';
            return;
        }

        // Парсим введенную дату
        const date = parseDate(newDisplayValue);
        if (date) {
            const isoDate = toISODate(date);
            onChange(isoDate);
            lastValidValue.current = isoDate;
        }
    };

    // При потере фокуса форматируем дату или возвращаем последнее валидное значение
    const handleBlur = () => {
        if (!displayValue) {
            onChange('');
            return;
        }

        const date = parseDate(displayValue);
        if (date) {
            const formattedDate = formatDate(date);
            setDisplayValue(formattedDate);
        } else {
            // Возвращаем последнее валидное значение
            setDisplayValue(lastValidValue.current ? formatDate(lastValidValue.current) : '');
        }
    };

    return (
        <Input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            error={error}
            disabled={disabled}
            required={required}
            name={name}
            pattern="\d{2}\.\d{2}\.\d{4}"
            inputMode="numeric"
        />
    );
};