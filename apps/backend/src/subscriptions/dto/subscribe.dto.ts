import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubscribeDto {
    @IsString({ message: 'ID представителя должно быть строкой' })
    @IsNotEmpty({ message: 'ID представителя не может быть пустым' })
    @ApiProperty({
        example: 'cmik6d2sm0000mojf4oz1jraa',
    })
    representativeId: string;
}
