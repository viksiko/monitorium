import { Module } from '@nestjs/common';
import { NotificationModule } from '@src/notification/notification.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
    controllers: [PostController],
    providers: [PostService],
    imports: [NotificationModule],
})
export class PostModule {}
