import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Введите корректный email'),
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export const registerSchema = loginSchema.extend({
    name: z.string().min(2, 'Имя должно быть не менее 2 символов'),
    passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Пароли не совпадают",
    path: ["passwordConfirm"],
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;