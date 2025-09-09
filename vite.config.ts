import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    // Use absolute paths for Vercel
    base: '/',
    
    server: {
      host: '::',
      port: 8080,
    },

    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]',
        },
      },
    },

    // Environment variables
    define: {
      'process.env': { ...env },
    },
  };
});
