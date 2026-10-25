import { z } from 'zod';

// Базовые схемы
export const emailSchema = z
    .string()
    .email('Некорректный email адрес');

export const passwordSchema = z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов');

export const portionsSchema = z
    .number()
    .int('Количество порций должно быть целым числом')
    .min(1, 'Минимальное количество порций: 1');

export const quantitySchema = z
    .number()
    .positive('Количество должно быть больше 0');

export const weightSchema = z
    .number()
    .positive('Вес должен быть больше 0')
    .transform(val => Math.round(val * 100) / 100); // Округление до 2 знаков

// Схема дат производства и годности
export const dateRangeSchema = z.object({
    production_date: z.date(),
    expiry_date: z.date()
}).refine(
    data => data.production_date <= data.expiry_date,
    {
        message: 'Дата производства должна быть раньше даты истечения срока годности',
        path: ['expiry_date']
    }
);

// Составные схемы для форм
export const authSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

export const ingredientSchema = z.object({
    name: z.string().min(1, 'Введите название ингредиента'),
    quantity: quantitySchema,
    unit: z.string().min(1, 'Выберите единицу измерения'),
    price_per_unit: z.number().positive('Цена должна быть больше 0')
});

export const recipeSchema = z.object({
    name: z.string().min(1, 'Введите название рецепта'),
    portions: portionsSchema,
    weight: weightSchema,
    ingredients: z.array(ingredientSchema)
        .min(1, 'Добавьте хотя бы один ингредиент')
});

// Типы на основе схем
export type AuthFormData = z.infer<typeof authSchema>;
export type IngredientFormData = z.infer<typeof ingredientSchema>;
export type RecipeFormData = z.infer<typeof recipeSchema>;