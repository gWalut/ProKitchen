import { cn } from '@/shared/utils/cn';

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
    return (
        <div
            className={cn(
                'animate-pulse rounded bg-gray-200 dark:bg-gray-700',
                className
            )}
            role="status"
            aria-label="Загрузка"
        />
    );
};

// Предопределенные варианты скелетонов
export const SkeletonText = () => (
    <Skeleton className="h-4 w-3/4" />
);

export const SkeletonCard = () => (
    <Skeleton className="h-48 w-full" />
);

export const SkeletonAvatar = () => (
    <Skeleton className="h-12 w-12 rounded-full" />
);

// Скелетон для списка
interface SkeletonListProps {
    count?: number;
    className?: string;
}

export const SkeletonList = ({ count = 3, className }: SkeletonListProps) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <Skeleton
                key={i}
                className={cn('h-16 w-full', className)}
            />
        ))}
    </div>
);