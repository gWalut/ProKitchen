import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../../../shared/components/Button';

describe('Button Component (Unit)', () => {
    it('renders correctly with given text', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText(/Click Me/i)).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        fireEvent.click(screen.getByText(/Click Me/i));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled Button</Button>);
        const button = screen.getByText(/Disabled Button/i);
        expect(button).toBeDisabled();
    });
});
