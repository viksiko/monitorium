import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RATE_LIMIT_EXCEEDED_MESSAGE } from '@src/constants/api-messages.constants';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async throwThrottlingException(): Promise<void> {
        throw new HttpException(
            {
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                error: 'Too Many Requests',
                message: RATE_LIMIT_EXCEEDED_MESSAGE, // Ваше сообщение
            },
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }
}
