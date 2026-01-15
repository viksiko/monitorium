import { z } from 'zod';

export const registerStep1Schema = z
    .object({
        fullName: z
            .string()
            .min(1, 'Введите ФИО')
            .min(5, 'ФИО должно быть не короче 5 символов'),

        email: z
            .string()
            .min(1, 'Введите email')
            .email('Введите корректный email'),

        password: z.string().min(6, 'Пароль должен быть не менее 8 символов'),

        confirmPassword: z.string().min(6, 'Подтвердите пароль'),

        phone: z
            .string()
            .optional()
            .refine(
                (val) => {
                    if (!val) return true;

                    const digits = val.replace(/\D/g, '');

                    return /^([178])[0-9]{10}$/.test(digits);
                },
                {
                    message: 'Введите корректный номер телефона',
                },
            ),

        // useAddress: z.boolean(),

        // address: z.string().optional(),
        // district: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Пароли не совпадают',
    });

export type RegisterStep1FormValues = z.infer<typeof registerStep1Schema>;
