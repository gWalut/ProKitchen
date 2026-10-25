import type { Meta, StoryObj } from '@storybook/react';
import { IngredientsTable } from '../components/IngredientsTable';

const meta = {
    title: 'Components/IngredientsTable',
    component: IngredientsTable,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof IngredientsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleIngredients = [
    {
        id: 1,
        name: 'Томаты',
        amount: 100,
        calories: 18,
        proteins: 0.9,
        fats: 0.2,
        carbohydrates: 3.9
    },
    {
        id: 2,
        name: 'Куриная грудка',
        amount: 150,
        calories: 165,
        proteins: 31,
        fats: 3.6,
        carbohydrates: 0
    }
];

export const Default: Story = {
    args: {
        ingredients: sampleIngredients,
        onDelete: (id) => console.log('Delete:', id),
        onAmountChange: (id, amount) => console.log('Amount changed:', id, amount),
    },
};

export const Empty: Story = {
    args: {
        ingredients: [],
        onDelete: () => { },
        onAmountChange: () => { },
    },
};

export const Loading: Story = {
    args: {
        ...Default.args,
        loading: true,
    },
};