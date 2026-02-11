import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: '::', // позволяет работать и с localhost, и с внешним IP
        port: process.env.VITE_FRONTEND_PORT
            ? parseInt(process.env.VITE_FRONTEND_PORT, 10)
            : 8081,
        proxy: {
            // когда backend появится — запросы /api будут проксироваться
            '/api': {
                target: `http://localhost:${process.env.VITE_API_PORT}`,
                changeOrigin: true,
                secure: false,
            },
        },
    },
    plugins: [react(), mode === 'development' && componentTagger()].filter(
        Boolean,
    ),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@monorepo/types': path.resolve(
                __dirname,
                '../../packages/types/src',
            ),
        },
    },
}));
