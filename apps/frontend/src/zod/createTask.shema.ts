import { z } from 'zod';

export const createTaskSchema = z.object({
    assigneeId: z.string().min(1, 'Это поле обязательно'),

    title: z.string().min(1, 'Это поле обязательно').min(10, 'Заголовок должно быть не менее 10 символов'),

    address: z.string().min(1, 'Это поле обязательно').min(10, 'Заголовок должно быть не менее 10 символов'),

    description: z.string().min(1, 'Это поле обязательно').min(10, 'Заголовок должно быть не менее 10 символов'),

    solution: z.string().optional(),

    endDate: z.string().min(1, 'Это поле обязательно'),
});

export type LoginFormValues = z.infer<typeof createTaskSchema>;
