interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
}

export const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className
}: OptimizedImageProps) => {
    // Получаем расширение файла
    const ext = src.split('.').pop()?.toLowerCase();

    // Для SVG просто возвращаем img
    if (ext === 'svg') {
        return (
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={className}
            />
        );
    }

    // Для остальных изображений используем picture с webp
    return (
        <picture>
            <source
                srcSet={src.replace(`.${ext}`, '.webp')}
                type="image/webp"
            />
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={className}
                loading="lazy"
                decoding="async"
            />
        </picture>
    );
};