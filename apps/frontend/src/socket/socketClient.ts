import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;
let socket: Socket | null = null;

export const connectSocket = (token: string) => {
    if (socket) return socket; // уже есть соединение

    socket = io(API_URL, {
        auth: {
            token,
        },
        transports: ['websocket'],
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;
