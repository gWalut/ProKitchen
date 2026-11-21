import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { TopBar } from './TopBar';
const meta = {
    title: 'Components/TopBar', component: TopBar,
    decorators: [(Story) => <MemoryRouter><AuthProvider><Story /></AuthProvider></MemoryRouter>],
    parameters: { layout: 'fullscreen' }, tags: ['autodocs']
} satisfies Meta<typeof TopBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
