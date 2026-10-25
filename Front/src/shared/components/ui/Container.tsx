interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const Container = ({ children, className = '' }: ContainerProps) => {
    return (
        <div className={`mx-auto max-w-container px-4 ${className}`}>
            {children}
        </div>
    );
};