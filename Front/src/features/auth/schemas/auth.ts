import { z } from 'zod';

export const authSchema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});

export type AuthFormData = z.infer<typeof authSchema>;

export const registerSchema = z.object({
    email: z.string()
        .email('Введите корректный email'),
    password: z.string()
        .min(8, 'Пароль должен содержать минимум 8 символов'),
    passwordConfirm: z.string(),
    acceptPrivacyPolicy: z.boolean()
        .refine(val => val === true, 'Необходимо принять политику конфиденциальности')
}).refine(data => data.password === data.passwordConfirm, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm']
});

export type RegisterForm = z.infer<typeof registerSchema>;