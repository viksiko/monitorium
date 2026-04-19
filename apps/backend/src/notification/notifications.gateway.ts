import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor() {}

    @WebSocketServer()
    server!: Server;

    //  хранение подключений
    private userSockets = new Map<string, Set<string>>();

    // подключение
    async handleConnection(client: Socket): Promise<void> {
        const token = client.handshake.auth?.token;

        if (!token) {
            client.disconnect();
            return;
        }

        const payload: JwtPayload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
        const userId = payload.id;

        // Добавляем сокет пользователя в Map userSockets
        // Если пользователь подключается впервые — создаём новый Set для хранения его сокетов
        // Если уже есть подключения — просто добавляем новый socket.id (например, новая вкладка)
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(client.id);

        // Подписываем сокет на комнату пользователя (для отправки уведомлений)
        client.join(userId);

        //⚠️ в режиме продакшен убрать
        console.log(`🟢 Socket ${client.id} joined room: ${userId}`);
    }

    // отключение
    handleDisconnect(client: Socket): void {
        for (const [userId, sockets] of this.userSockets.entries()) {
            if (sockets.has(client.id)) {
                sockets.delete(client.id);

                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                }

                console.log(`❌ User ${userId} disconnected: ${client.id}`);
                break;
            }
        }
    }

    // отправка уведомления
    sendNotification(userId: string, payload: JwtPayload): void {
        this.server.to(userId).emit('notification:new', payload);
    }
}
