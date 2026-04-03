import { Module } from '@nestjs/common';
import { DistrictController } from './district.controller';
import { DistrictService } from './district.service';

@Module({
    providers: [DistrictService],
    controllers: [DistrictController],
})
export class DistrictModule {}
