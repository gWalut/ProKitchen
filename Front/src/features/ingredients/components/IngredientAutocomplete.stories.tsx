import type { Meta, StoryObj } from '@storybook/react';
import { IngredientAutocomplete } from './IngredientAutocomplete';
const meta = {
    title: 'Components/IngredientAutocomplete', component: IngredientAutocomplete,
    parameters: { layout: 'centered' }, tags: ['autodocs'],
    args: { value: '', onChange: () => {}, onSelect: () => {} }
} satisfies Meta<typeof IngredientAutocomplete>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithValue: Story = { args: { value: 'Картофель' } };
