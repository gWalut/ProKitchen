import type { Meta, StoryObj } from '@storybook/react';
import { IngredientAutocomplete } from '../components/IngredientAutocomplete';
import { withRouter } from 'storybook-addon-react-router-v6';

const meta = {
    title: 'Components/IngredientAutocomplete',
    component: IngredientAutocomplete,
    decorators: [withRouter],
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof IngredientAutocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onSelect: (ingredient) => console.log('Selected:', ingredient),
        placeholder: 'Поиск ингредиента...',
    },
};

export const WithLabel: Story = {
    args: {
        ...Default.args,
        label: 'Ингредиент',
    },
};

export const Disabled: Story = {
    args: {
        ...Default.args,
        disabled: true,
    },
};