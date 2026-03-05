import { CreateDialog, Dialog, DialogAndSubscriptions, Message } from '@monorepo/types';
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { HEADERS_AUTHORIZATION } from '@src/constants/swagger/api-headers.swagger';
import { PARAM_MESSAGE_DIALOG, PARAM_READ_DIALOG } from '@src/constants/swagger/api-param.swagger';
import {
    CREATE_DIALOG_SUCCESS_RESPONSE,
    CREATE_DIALOG_VALIDATION_ERROR_RESPONSE,
    CREATE_MESSAGE_DIALOG_SUCCESS_RESPONSE,
    CREATE_MESSAGE_DIALOG_VALIDATION_ERROR_RESPONSE,
    DIALOG_NOT_FOUND_RESPONSE,
    DIALOGS_AND_SUBSCRIPTIONS_RESPONSE,
    GET_DIALOG_MESSAGES_RESPONSE,
    NO_DIALOG_ACCESS_RESPONSE,
    NO_SUBSCRIPTION_RESPONSE,
} from '@src/constants/swagger/dialog-responses.swagger';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
} from '@src/constants/swagger/shared-responses.swagger';
import { DialogService } from './dialog.service';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';

@UseGuards(JwtAuthGuard)
@ApiHeader(HEADERS_AUTHORIZATION)
@ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
@ApiResponse(DATABASE_ERROR_RESPONSE)
@Controller({
    path: 'dialogs',
    version: '1',
})
@Controller('dialog')
export class DialogController {
    constructor(private readonly dialogsService: DialogService) {}

    // создать диалог
    @Post()
    @ApiOperation({ summary: 'Создать новый диалог' })
    @ApiResponse(CREATE_DIALOG_SUCCESS_RESPONSE)
    @ApiResponse(CREATE_DIALOG_VALIDATION_ERROR_RESPONSE)
    @ApiResponse(NO_SUBSCRIPTION_RESPONSE)
    async createDialog(@Body() dto: CreateDialogDto, @Req() req): Promise<CreateDialog> {
        const userId = req.user.id;

        return this.dialogsService.createDialog(userId, dto);
    }

    // список моих диалогов c подписками
    @Get()
    @ApiOperation({ summary: 'Получить спиок диалогов и подписки без диалога' })
    @ApiResponse(DIALOGS_AND_SUBSCRIPTIONS_RESPONSE)
    getDialogsAndSubscriptions(@Req() req): Promise<DialogAndSubscriptions[]> {
        return this.dialogsService.getDialogsAndSubscriptions(req.user.id);
    }

    // создать сообщение
    @Post(':dialogId/messages')
    @ApiOperation({ summary: 'Создать сообщение в диалоге' })
    @ApiParam(PARAM_MESSAGE_DIALOG)
    @ApiResponse(CREATE_MESSAGE_DIALOG_SUCCESS_RESPONSE)
    @ApiResponse(NO_DIALOG_ACCESS_RESPONSE)
    @ApiResponse(CREATE_MESSAGE_DIALOG_VALIDATION_ERROR_RESPONSE)
    @ApiResponse(DIALOG_NOT_FOUND_RESPONSE)
    createMessage(@Param('dialogId') dialogId: string, @Body() dto: CreateMessageDto, @Req() req): Promise<Message> {
        return this.dialogsService.createMessage(dialogId, req.user.id, dto);
    }

    // получить сообщения (с polling)
    @Get(':dialogId/messages')
    @ApiOperation({ summary: 'Получить сообщения из диалога' })
    @ApiParam(PARAM_MESSAGE_DIALOG)
    @ApiResponse(GET_DIALOG_MESSAGES_RESPONSE)
    @ApiResponse(NO_DIALOG_ACCESS_RESPONSE)
    @ApiResponse(DIALOG_NOT_FOUND_RESPONSE)
    getMessages(@Param('dialogId') dialogId: string, @Query() query: GetMessagesDto, @Req() req): Promise<Message[]> {
        return this.dialogsService.getMessages(dialogId, req.user.id, query.afterId);
    }

    // обновляет данные прочтеия сообщения (с polling)
    @Patch(':dialogId/read')
    @ApiOperation({ summary: 'Обновить время прочтения сообщений' })
    @ApiParam(PARAM_READ_DIALOG)
    @ApiResponse(NO_DIALOG_ACCESS_RESPONSE)
    @ApiResponse(DIALOG_NOT_FOUND_RESPONSE)
    async updateDialogTimeRead(@Param('dialogId') dialogId: string, @Req() req): Promise<Dialog> {
        const userId = req.user.id;

        return this.dialogsService.updateDialogTimeRead(dialogId, userId);
    }
}
