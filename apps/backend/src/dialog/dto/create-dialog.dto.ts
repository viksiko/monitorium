import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDialogDto {
    @IsString({ message: 'ID представителя должен быть строкой' })
    @IsNotEmpty({ message: 'ID представителя не может быть пустым' })
    @ApiProperty({
        example: 'cmm8ak4c5000ddsjf7hhizpj2',
    })
    representativeId: string;

    @IsString({ message: 'Текст сообщения должен быть строкой' })
    @IsNotEmpty({ message: 'Текст сообщения не может быть пустым' })
    @MaxLength(5000, { message: 'Текст сообщения не может превышать 5000 символов' })
    @ApiProperty({
        example: 'Здравствуйте! У меня вопрос по вашей программе...',
    })
    text: string;
}
