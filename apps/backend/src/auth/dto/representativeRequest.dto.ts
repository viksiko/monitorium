import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RepresentativeRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'ID пользователя не может быть пустым' })
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
    })
    userId: string;

    @IsString()
    @IsNotEmpty({ message: 'Должность не может быть пустым' })
    @ApiProperty({
        example: 'Депутат Государственной Думы',
    })
    position: string;

    @IsString()
    @IsNotEmpty({ message: 'Политическая парития не может быть пустым' })
    @ApiProperty({
        example: 'Единая Россия',
    })
    party?: string;

    @IsString()
    @IsNotEmpty({ message: 'Округ не может быть пустым' })
    @ApiProperty({
        example: 'Окру №8',
    })
    district?: string;

    @IsString()
    @IsNotEmpty({ message: 'Биография не может быть пустым' })
    @ApiProperty({
        example: 'Опытный политик с 10-летним стажем работы...',
    })
    bio?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'id_card_12345.jpg',
    })
    idCard?: string; // можно хранить имя файла или путь
}
