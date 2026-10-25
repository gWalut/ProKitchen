import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    showBackButton?: boolean;
    actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, icon, showBackButton = false, actions }: PageHeaderProps) => {
    const navigate = useNavigate();

    return (
        <div className="mb-8 animate-slide-up">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <button
                            onClick={() => navigate(-1)}
                            className="group p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                            aria-label="Назад"
                        >
                            <span className="text-xl group-hover:-translate-x-1 transition-transform inline-block">←</span>
                        </button>
                    )}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {icon && <span className="text-4xl">{icon}</span>}
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
                                {title}
                            </h1>
                        </div>
                        {subtitle && (
                            <p className="text-gray-600 dark:text-gray-400 ml-1">{subtitle}</p>
                        )}
                    </div>
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
