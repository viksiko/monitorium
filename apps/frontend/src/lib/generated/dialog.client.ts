/**
 * HTTP-клиент для DialogController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type { CreateDialogDtoModel, CreateMessageDtoModel, GetMessagesDtoModel } from './models/index';
import type { CreateDialog, Dialog, DialogAndSubscriptions, Message } from '@monorepo/types';

export const dialog = {
    createDialog: async (dto: CreateDialogDtoModel) => {
        return customInstance<CreateDialog>({
            url: `/api/v1/dialogs`,
            method: 'POST',
            data: dto,
        });
    },
    getDialogsAndSubscriptions: async () => {
        return customInstance<DialogAndSubscriptions[]>({
            url: `/api/v1/dialogs`,
            method: 'GET',
        });
    },
    createMessage: async (dialogId: string, dto: CreateMessageDtoModel) => {
        return customInstance<Message>({
            url: `/api/v1/dialogs/${encodeURIComponent(String(dialogId))}/messages`,
            method: 'POST',
            data: dto,
        });
    },
    getMessages: async (dialogId: string, query: GetMessagesDtoModel) => {
        return customInstance<Message[]>({
            url: `/api/v1/dialogs/${encodeURIComponent(String(dialogId))}/messages`,
            method: 'GET',
            params: query,
        });
    },
    updateDialogTimeRead: async (dialogId: string) => {
        return customInstance<Dialog>({
            url: `/api/v1/dialogs/${encodeURIComponent(String(dialogId))}/read`,
            method: 'PATCH',
        });
    },
} as const;
