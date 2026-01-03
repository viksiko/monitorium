import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Некорректный email' })
    @MaxLength(50, { message: 'Email должен быть не более 50 символов' })
    @IsNotEmpty({ message: 'Email не может быть пустым' })
    @ApiProperty({
        example: 'user1@email.ru',
    })
    email: string;
}
