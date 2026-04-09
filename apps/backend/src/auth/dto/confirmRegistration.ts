import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ConfirmRegistration {
    @IsString({ message: 'ID пользователядолжно быть строкой' })
    @IsNotEmpty({ message: 'ID пользователя не может быть пустым' })
    @ApiProperty({
        example: 'cmik6d2sm0000mojf4oz1jraa',
    })
    userId: string;

    @IsString()
    @IsNotEmpty({ message: 'Код подтверждения не может быть пустым' })
    @Length(6, 6, {
        message: 'Код подтверждения должен состоять из 6 символов',
    })
    @ApiProperty({
        example: '123456',
    })
    code: string;
}
