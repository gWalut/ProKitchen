import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '@/shared/components/Input';
import { Spinner } from '@/shared/components/ui/Spinner';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { fullName?: string; newPassword?: string }) => Promise<void>;
    userName: string;
    userEmail: string;
}

export const EditUserModal = ({ isOpen, onClose, onSave, userName, }: EditUserModalProps) => {
    const [fullName, setFullName] = useState(userName);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFullName(userName);
            setNewPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [isOpen, userName]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Проверяем имя
        if (!fullName.trim()) {
            setError('Имя пользователя не может быть пустым');
            return;
        }

        if (fullName.trim().length > 100) {
            setError('Имя пользователя слишком длинное (максимум 100 символов)');
            return;
        }

        // Если меняем пароль, проверяем совпадение
        if (newPassword.trim()) {
            if (newPassword.length < 6) {
                setError('Пароль должен быть не менее 6 символов');
                return;
            }

            if (newPassword !== confirmPassword) {
                setError('Пароли не совпадают');
                return;
            }
        }

        try {
            setIsLoading(true);
            const data: { fullName?: string; newPassword?: string } = {};

            // Всегда отправляем имя, если оно отличается от текущего
            const trimmedName = fullName.trim();
            if (trimmedName !== userName) {
                data.fullName = trimmedName;
            }

            // Отправляем пароль, если он введен
            if (newPassword.trim()) {
                data.newPassword = newPassword;
            }

            // Проверяем, есть ли что-то для сохранения
            if (Object.keys(data).length === 0) {
                setError('Нет изменений для сохранения');
                return;
            }

            await onSave(data);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Ошибка при сохранении изменений');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Редактирование пользователя
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Полное имя
                        </label>
                        <Input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Введите имя пользователя"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Новый пароль
                        </label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Оставьте пустым, чтобы не менять"
                            disabled={isLoading}
                        />
                    </div>

                    {newPassword && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Подтвердите пароль
                            </label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Введите пароль еще раз"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" />
                                    <span>Сохранение...</span>
                                </>
                            ) : (
                                'Сохранить'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
