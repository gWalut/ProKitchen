import { Switch } from '@headlessui/react';
import { cn } from '@/shared/utils/cn';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export const Toggle = ({ checked, onChange, label, disabled }: ToggleProps) => {
    return (
        <Switch.Group>
            <div className="flex items-center justify-between">
                {label && (
                    <Switch.Label className="mr-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {label}
                    </Switch.Label>
                )}
                <Switch
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className={cn(
                        checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-700',
                        'relative inline-flex h-6 w-11 min-w-[44px] min-h-[44px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    <span
                        className={cn(
                            checked ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        )}
                    />
                </Switch>
            </div>
        </Switch.Group>
    );
};