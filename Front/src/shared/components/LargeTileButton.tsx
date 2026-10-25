interface LargeTileButtonProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onClick: () => void;
    className?: string;
}

export const LargeTileButton = ({
    icon,
    title,
    subtitle,
    onClick,
    className = ''
}: LargeTileButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`group relative flex flex-col items-center justify-center w-full p-8 space-y-4 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 active:scale-95 min-h-[160px] overflow-hidden ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-400/0 via-purple-400/0 to-blue-400/0 group-hover:from-brand-400/10 group-hover:via-purple-400/10 group-hover:to-blue-400/10 transition-all duration-300"></div>

            <div className="relative flex items-center justify-center text-5xl transform group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>

            <div className="relative space-y-1 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-purple-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </button>
    );
};