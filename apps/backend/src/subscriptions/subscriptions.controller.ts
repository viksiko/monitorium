import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DATABASE_ERROR_RESPONSE } from '@src/constants/swagger/shared-responses.swagger';
import {
    SUBSCRIBE_CREATED_RESPONSE,
    SUBSCRIBE_ERROR_RESPONSE,
    SUBSCRIBE_USER_NOT_FOUND_ERROR_RESPONSE,
} from '@src/constants/swagger/subscriptions-responses.swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscribeDto } from '../subscriptions/dto/subscribe.dto';
import { SubscriptionService } from './subscriptions.service';

@Controller({
    path: 'subscriptions',
    version: '1',
})
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
    constructor(private readonly subscriptionsService: SubscriptionService) {}

    @Post()
    @ApiOperation({ summary: 'Подписка на представителя власти' })
    @ApiResponse(SUBSCRIBE_CREATED_RESPONSE)
    @ApiResponse(SUBSCRIBE_ERROR_RESPONSE)
    @ApiResponse(SUBSCRIBE_USER_NOT_FOUND_ERROR_RESPONSE)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    subscribe(@Req() req, @Body() dto: SubscribeDto): Promise<{ message: string }> {
        return this.subscriptionsService.subscribe(req.user.id, dto.representativeId);
    }

    // @Delete()
    // unsubscribe(@Req() req, @Body() dto: SubscribeDto) {
    //     return this.subscriptionsService.unsubscribe(
    //         req.user.id,
    //         dto.representativeId,
    //     );
    // }
}
