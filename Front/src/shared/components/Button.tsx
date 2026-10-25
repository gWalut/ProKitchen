import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-xl transition-all duration-200 min-h-[48px] px-6 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95',
    {
        variants: {
            variant: {
                primary: 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white focus:ring-brand-500 dark:from-brand-600 dark:to-brand-700 dark:hover:from-brand-700 dark:hover:to-brand-800',
                secondary: 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 border-2 border-brand-500 dark:border-brand-400 hover:bg-brand-50 dark:hover:bg-gray-700 focus:ring-brand-500 hover:border-brand-600 dark:hover:border-brand-500',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        defaultVariants: {
            variant: 'primary',
            fullWidth: false,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant,
    fullWidth,
    disabled,
    loading,
    children,
    ...props
}) => {
    return (
        <button
            className={buttonVariants({ variant, fullWidth, className })}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            ) : null}
            {children}
        </button>
    );
};

export default Button;