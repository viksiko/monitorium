import { District, DistrictStats } from '@monorepo/types';
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

    async getDistrictStats(id: string): Promise<DistrictStats | null> {
        try {
            const districtStats = await this.prisma.district.findUnique({
                where: { id },
                include: {
                    areas: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    tasks: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                            createdAt: true,
                            address: true,
                            desiredResolutionDate: true,
                            assignee: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                    users: {
                        where: {
                            role: 'REPRESENTATIVE',
                            isActive: true,
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            districtId: true,
                            isVerified: true,
                            representativeProfile: {
                                select: {
                                    id: true,
                                    position: true,
                                    party: true,
                                    rating: true,
                                    tasksTotal: true,
                                    tasksCompleted: true,
                                    attendance: true,
                                    lastActivity: true,
                                },
                            },
                        },
                        orderBy: { name: 'asc' },
                    },
                },
            });

            if (!districtStats) throw new NotFoundException(DISTRICT_NOT_FOUND);

            return districtStats;
        } catch (error) {
            logger.error('Failed when getting district by id', {
                category: 'DistrictService',
                operation: 'getDistrictStats',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }
}
