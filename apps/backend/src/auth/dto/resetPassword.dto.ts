import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class ResetPasswordDto {
    @IsString({ message: 'Токен должен быть строкой' })
    @IsNotEmpty({ message: 'Токен не должен быть пустым' })
    @ApiProperty({
        example: '9910b3b4-eeac-43c8-a92f-c13bf85c5942',
    })
    token: string;

    @IsString({ message: 'Пароль должно быть строкой' })
    @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
    @MaxLength(50, { message: 'Пароль должен быть не более 50 символов' })
    @IsNotEmpty({ message: 'Пароль не может быть пустым' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message:
                'Пароль должен содержать минимум 8 символов, одну заглавную букву, одну цифру и один специальный символ',
        },
    )
    @ApiProperty({ example: 'Abc123!' })
    password: string;
}
