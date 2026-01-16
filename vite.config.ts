import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true, // слушать на 0.0.0.0
    port: Number(process.env.PORT) || 4173,
    allowedHosts: ['three58sale.onrender.com'] // разрешаем хост Render
  }
});
