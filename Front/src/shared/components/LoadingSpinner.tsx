interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    text?: string;
}

export const LoadingSpinner = ({ size = 'md', fullScreen = false, text }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-brand-500 rounded-full animate-spin`}></div>
                <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-purple-500 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            {text && (
                <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50/90 via-purple-50/90 to-pink-50/90 dark:from-gray-900/90 dark:via-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
