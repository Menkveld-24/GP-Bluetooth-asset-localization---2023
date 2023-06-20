// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import tsConfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), eslint(), tsConfigPaths()],
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './src/components'),
            '@router': path.resolve(__dirname, './src/router'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@stores': path.resolve(__dirname, './src/stores'),
            '@guards': path.resolve(__dirname, './src/router/guards'),
            '@': path.resolve(__dirname, './src'),
        },
    },
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif', '**/*.ico', '**/*.json'],
    server: {
        port: 3000,
        proxy: {
            // send all api requests to the nodejs server
            '^/api/.': {
                target: `http://localhost:3001`,
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
