import { z } from 'zod';

export const registerStep1Schema = z
    .object({
        fullName: z
            .string()
            .min(1, 'Введите ФИО')
            .min(3, 'ФИО должно быть не менее 3 символов'),

        email: z
            .string()
            .min(1, 'Введите email')
            .email('Введите корректный email'),

        password: z
            .string()
            .min(8, 'Пароль должен быть не менее 8 символов')
            .refine((password) => /[A-Z]/.test(password), {
                message: 'Пароль должен содержать хотя бы одну заглавную букву',
            })
            .refine((password) => /\d/.test(password), {
                message: 'Пароль должен содержать хотя бы одну цифру',
            })
            .refine(
                (password) =>
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
                {
                    message:
                        'Пароль должен содержать хотя бы один специальный символ',
                },
            ),

        confirmPassword: z.string().min(8, 'Подтвердите пароль'),

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
