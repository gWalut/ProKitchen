import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
                primary: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md',
                success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md',
                warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md',
                error: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md',
                info: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md',
                outline: 'bg-transparent border-2 border-brand-500 dark:border-brand-400 text-brand-700 dark:text-brand-400',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
    icon?: string;
}

export const Badge = ({ className, variant, icon, children, ...props }: BadgeProps) => {
    return (
        <span className={badgeVariants({ variant, className })} {...props}>
            {icon && <span className="text-sm">{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;
