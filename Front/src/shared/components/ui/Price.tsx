import { formatCurrency } from '../../utils/format';

interface PriceProps {
    amount: number;
    className?: string;
}

export const Price = ({ amount, className }: PriceProps) => {
    return (
        <span className={className}>
            {formatCurrency(amount)}
        </span>
    );
};