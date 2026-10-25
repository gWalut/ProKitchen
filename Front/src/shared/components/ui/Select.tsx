import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/shared/utils/cn';

export interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectProps {
    value: SelectOption;
    onChange: (option: SelectOption) => void;
    options: SelectOption[];
    label?: string;
    error?: string;
    disabled?: boolean;
}

export const Select = ({
    value,
    onChange,
    options,
    label,
    error,
    disabled
}: SelectProps) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    {label}
                </label>
            )}
            <Listbox value={value} onChange={onChange} disabled={disabled}>
                {() => (
                    <div className="relative">
                        <Listbox.Button
                            className={cn(
                                'relative w-full min-h-[44px] cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-dark-800 dark:border-dark-700',
                                error
                                    ? 'border-red-500'
                                    : 'border-gray-200 dark:border-dark-700',
                                disabled && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <span className="block truncate">{value.label}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </span>
                        </Listbox.Button>

                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg border border-gray-200 focus:outline-none dark:bg-dark-800 dark:border-dark-700">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.value}
                                    className={({ active }) =>
                                        cn(
                                            'relative cursor-pointer select-none py-2 pl-10 pr-4',
                                            active
                                                ? 'bg-primary-50 text-primary-900 dark:bg-dark-700 dark:text-primary-100'
                                                : 'text-gray-900 dark:text-gray-100'
                                        )
                                    }
                                    value={option}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className="block truncate">{option.label}</span>
                                            {selected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </div>
                )}
            </Listbox>
            {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};