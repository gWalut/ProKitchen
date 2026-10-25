import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema } from '@/features/auth/schemas/auth';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

type AuthFormData = { email: string; password: string };

interface LoginFormProps {
    onSubmit: (data: AuthFormData) => Promise<void>;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
    const { handleError } = useErrorHandler();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema)
    });

    const onSubmitHandler = async (data: AuthFormData) => {
        try {
            await onSubmit(data);
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
            <div>
                <Input
                    type="email"
                    placeholder="Email"
                    {...register('email')}
                    error={errors.email?.message}
                />
            </div>

            <div>
                <Input
                    type="password"
                    placeholder="Пароль"
                    {...register('password')}
                    error={errors.password?.message}
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
        </form>
    );
};