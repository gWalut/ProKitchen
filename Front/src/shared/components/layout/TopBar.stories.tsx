import type { Meta, StoryObj } from '@storybook/react';
import { TopBar } from '../components/TopBar';
import { withRouter } from 'storybook-addon-react-router-v6';

const meta = {
    title: 'Components/TopBar',
    component: TopBar,
    decorators: [withRouter],
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
    args: {
        user: null,
        onLogout: () => console.log('Logout clicked'),
    },
};

export const LoggedIn: Story = {
    args: {
        user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        },
        onLogout: () => console.log('Logout clicked'),
    },
};