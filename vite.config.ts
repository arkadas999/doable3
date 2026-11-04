import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import inertia from '@inertiajs/vite';
import path from 'path';

export default defineConfig({
    publicDir: false,
    plugins: [
        vue(),
        tailwindcss(),
        inertia(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        target: 'es2015',
        outDir: 'public/build',
        emptyOutDir: true,
        manifest: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            input: 'resources/js/app.ts',
            onwarn(warning, defaultHandler) {
                if (warning.code === 'INVALID_ANNOTATION') return;
                defaultHandler(warning);
            },
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('@vue') || id.includes('vue')) {
                            return 'vendor-vue';
                        }
                        if (id.includes('reka-ui') || id.includes('@vueuse')) {
                            return 'vendor-reka';
                        }
                        if (id.includes('@lucide') || id.includes('lucide')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('@inertiajs')) {
                            return 'vendor-inertia';
                        }
                        return 'vendor';
                    }
                },
            },
        },
    },
    server: {
        origin: 'http://localhost:5173',
        cors: true,
        strictPort: true,
        port: 5173,
    }
});
