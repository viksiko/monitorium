import { District } from '@monorepo/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DISTRICT_NOT_FOUND } from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class DistrictService {
    constructor(private prisma: PrismaService) {}
    async getAllDistricts(areas = false): Promise<District[]> {
        try {
            return await this.prisma.district.findMany({
                include: areas ? { areas: true } : undefined,
            });
        } catch (error) {
            logger.error('Failed to find districts', {
                category: 'database',
                operation: 'getAllDistricts',
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    async getDistrictById(id: string): Promise<District | null> {
        try {
            const district = await this.prisma.district.findUnique({
                where: { id },
            });

            if (!district) throw new NotFoundException(DISTRICT_NOT_FOUND);

            return district;
        } catch (error) {
            logger.error('Failed when getting district by id', {
                category: 'DistrictService',
                operation: 'getDistrictById',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }
}
