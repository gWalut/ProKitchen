import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={props.id}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={`
              w-full px-3 py-2 bg-white border rounded-lg 
              text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-primary-500'
                            }
              ${className}
            `}
                        {...props}
                    />
                </div>
                {(error || hint) && (
                    <p
                        className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);