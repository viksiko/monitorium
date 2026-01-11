import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Это поле обязательно')
        .email('Введите корректный email'),

    password: z.string().min(6, 'Пароль должен быть не менее 8 символов'),
});

// Тип для TypeScript на основе схемы
export type LoginFormValues = z.infer<typeof loginSchema>;
