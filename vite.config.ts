import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Este proxy só funciona em desenvolvimento local
      // Em produção (systemwhite.com.br ou white-dash.pages.dev), a aplicação usará diretamente https://api.systemwhite.com.br
      // conforme configurado em src/utils/apiUtils.ts
      '/api': {
        target: 'https://api.systemwhite.com.br',
        changeOrigin: true,
        secure: true, // Permite conexões HTTPS
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          // Adiciona cabeçalhos CORS no proxy para contornar problemas com a API
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
          'Access-Control-Allow-Credentials': 'true'
        },
        bypass: (req) => {
          // Log para diagnóstico
          console.log(`Requisição proxy: ${req.method} ${req.url}`);
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Remove os cabeçalhos que podem causar problemas de CORS
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');

            // Adiciona um cabeçalho User-Agent para identificar requisições do ambiente de desenvolvimento
            proxyReq.setHeader('User-Agent', 'WhiteDash-DevEnvironment/1.0');
          });

          // Adiciona tratamento de erros para diagnósticos
          proxy.on('error', (err) => {
            /* eslint-disable-next-line */
            console && console.error && console.error('Erro no proxy:', err);
          });
        }
      },
    },
    cors: false, // Desativa o CORS no servidor de desenvolvimento do Vite
    hmr: {
      overlay: true // Mostrar overlay de erro para HMR
    }
  },
  build: {
    sourcemap: true, // Gerar sourcemaps para depuração em produção
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa as bibliotecas principais em chunks distintos para melhor caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'chart-vendor': ['recharts']
        }
      }
    }
  }
})
