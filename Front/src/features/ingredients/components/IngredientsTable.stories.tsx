import type { Meta, StoryObj } from '@storybook/react';
import { IngredientsTable } from './IngredientsTable';
const meta = {
    title: 'Components/IngredientsTable', component: IngredientsTable,
    parameters: { layout: 'padded' }, tags: ['autodocs'],
    args: { onChangeRows: () => {}, onAddRow: () => {}, onRemoveRow: () => {} }
} satisfies Meta<typeof IngredientsTable>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { rows: [{ ingredient: {
    id: 1, name: 'Картофель', unit: 'г', price_per_unit: 0.05
}, quantity: 200, unitPrice: 0.05, cost: 10 }] } };
export const Empty: Story = { args: { rows: [] } };
