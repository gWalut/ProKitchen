import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, AdminUser } from '@/api/endpoints';
import { useRole } from '@/features/auth/hooks/useRole';
import toast from 'react-hot-toast';
import { Spinner } from '@/shared/components/ui/Spinner';
import { UserCircleIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { EditUserModal } from '../components/EditUserModal';

export const AdminUsersPage = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const { isAdmin } = useRole();
    const navigate = useNavigate();

    useEffect(() => {
        // Если не админ, редиректим
        if (!isAdmin) {
            navigate('/main');
            return;
        }

        loadUsers();
    }, [isAdmin, navigate]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getUsers();
            setUsers(response.data);
        } catch (error: any) {
            toast.error(error.message || 'Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        if (!confirm(`Изменить роль пользователя на "${newRole}"?`)) {
            return;
        }

        try {
            setActionLoading(userId);
            await adminApi.updateUserRole(userId, newRole);
            toast.success('Роль успешно изменена');
            loadUsers();
        } catch (error: any) {
            toast.error(error.message || 'Ошибка изменения роли');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditUser = (user: AdminUser) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };

    const handleSaveUser = async (data: { fullName?: string; newPassword?: string }) => {
        if (!selectedUser) return;

        try {
            await adminApi.updateUserData(selectedUser.id, data);
            toast.success('Изменения применены');
            loadUsers();
        } catch (error: any) {
            throw new Error(error.message || 'Ошибка изменения данных пользователя');
        }
    };

    const handleDeleteUser = async (userId: number, email: string) => {
        if (!confirm(`Вы действительно хотите удалить пользователя ${email}?`)) {
            return;
        }

        try {
            setActionLoading(userId);
            await adminApi.deleteUser(userId);
            toast.success('Пользователь удален');
            loadUsers();
        } catch (error: any) {
            toast.error(error.message || 'Ошибка удаления пользователя');
        } finally {
            setActionLoading(null);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        return role === 'admin'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
                        aria-label="Назад к настройкам"
                    >
                        <span className="text-xl">←</span>
                        <span className="font-medium">Назад</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Управление пользователями</h1>
                    <div className="w-24"></div>
                </div>

                {/* Info block */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        Всего пользователей: <span className="font-semibold text-gray-900 dark:text-gray-100">{users.length}</span>
                    </p>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Пользователь
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Роль
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Дата регистрации
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.fullName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        ID: {user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRoleChange(user.id, user.role)}
                                                    disabled={actionLoading === user.id}
                                                    className="px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Изменить роль"
                                                >
                                                    {actionLoading === user.id ? (
                                                        <Spinner size="sm" />
                                                    ) : (
                                                        user.role === 'admin' ? '→ User' : '→ Admin'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    disabled={actionLoading === user.id}
                                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Редактировать пользователя"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    disabled={actionLoading === user.id}
                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Удалить пользователя"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {users.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <p className="text-gray-600 dark:text-gray-400">Пользователи не найдены</p>
                    </div>
                )}

                {/* Edit User Modal */}
                {selectedUser && (
                    <EditUserModal
                        isOpen={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        onSave={handleSaveUser}
                        userName={selectedUser.fullName}
                        userEmail={selectedUser.email}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
