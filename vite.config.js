import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite build configuration for the Quiz Builder React conversion.
export default defineConfig({
  plugins: [react()],
});
