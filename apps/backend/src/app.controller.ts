import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HEALTH_CHECK_API } from './constants/swagger/app-responst.swagger';

@Controller({
    version: '1',
})
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('health')
    @ApiOperation({ summary: 'Проверки соединения к API сервису' })
    @ApiResponse(HEALTH_CHECK_API)
    healthCheck(): {
        status: string;
        service: string;
    } {
        return {
            status: 'ok',
            service: 'Monitorium Backend',
        };
    }
}
