import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @IsString({ message: 'Имя должно быть строкой' })
    @MinLength(2, { message: 'Имя должно быть не менее 2 символов' })
    @MaxLength(50, { message: 'Имя должно быть не более 50 символов' })
    @IsNotEmpty({ message: 'Имя не может быть пустым' })
    @ApiProperty({ example: 'user1' })
    name: string;

    @IsEmail({}, { message: 'Некорректный email' })
    @MaxLength(50, { message: 'Email должен быть не более 50 символов' })
    @IsNotEmpty({ message: 'Email не может быть пустым' })
    @ApiProperty({
        example: 'user1@email.ru',
    })
    email: string;

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

    @IsString({ message: 'Телефон должно быть строкой' })
    @Length(11, 11, { message: 'Телефон должен состоять ровно из 11 символов' })
    @ApiProperty({
        example: '89775557799',
    })
    phone: string;
    // district: string;
    // isRepresentative: boolean;
    // position: string;
    // party: string;
}
