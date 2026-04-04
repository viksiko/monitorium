import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteCommentDto {
    @IsString({ message: 'ID комментария должен быть строкой' })
    @IsNotEmpty({ message: 'ID комментария не может быть пустым' })
    @ApiProperty({ example: 'cmnt1x2xk0000ycz91837rej4' })
    id: string;
}
