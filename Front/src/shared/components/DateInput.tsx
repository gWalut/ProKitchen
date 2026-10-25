import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DateInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    error?: string;
}

export const DateInput = ({
    label,
    value,
    onChange,
    min,
    max,
    error
}: DateInputProps) => {
    // Преобразование даты для отображения в российском формате
    const formatDisplayDate = (dateStr: string) => {
        try {
            return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: ru });
        } catch {
            return '';
        }
    };

    // Преобразование даты из российского формата в ISO
    const parseDisplayDate = (displayDate: string) => {
        try {
            const [day, month, year] = displayDate.split('.');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } catch {
            return '';
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
                className={`
          w-full px-3 py-2 bg-white border rounded-lg
          focus:outline-none focus:ring-2 focus:border-transparent
          ${error
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary-500'
                    }
        `}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};