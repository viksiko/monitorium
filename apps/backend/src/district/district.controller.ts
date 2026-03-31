import { District } from '@monorepo/types';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { HEADERS_AUTHORIZATION } from '@src/constants/swagger/api-headers.swagger';
import { PARAM_DISTRICT_ID } from '@src/constants/swagger/api-param.swagger';
import { DISTRICT_QUERY_AREAS } from '@src/constants/swagger/api-query.swagger';
import {
    DISTRICT_NOT_FOUND_RESPONSE,
    GET_ALL_DISTRICTS_SUCCESS_RESPONSE,
} from '@src/constants/swagger/district-responses.swagger';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
} from '@src/constants/swagger/shared-responses.swagger';
import { DistrictService } from './district.service';

@UseGuards(JwtAuthGuard)
@ApiHeader(HEADERS_AUTHORIZATION)
@ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
@ApiResponse(DATABASE_ERROR_RESPONSE)
@Controller({
    path: 'districts',
    version: '1',
})
export class DistrictController {
    constructor(private readonly districtService: DistrictService) {}
    @Get()
    @ApiOperation({ summary: 'Получить все округа' })
    @ApiQuery(DISTRICT_QUERY_AREAS)
    @ApiResponse(GET_ALL_DISTRICTS_SUCCESS_RESPONSE)
    async getAllDistricts(@Query('areas') areas?: string): Promise<District[]> {
        return this.districtService.getAllDistricts(areas === 'true');
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить все данные окргуа по id' })
    @ApiParam(PARAM_DISTRICT_ID)
    @ApiResponse(DISTRICT_NOT_FOUND_RESPONSE)
    async getDistrictById(@Param('id') id: string): Promise<District | null> {
        return this.districtService.getDistrictById(id);
    }
}
