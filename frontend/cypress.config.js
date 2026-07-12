import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '25yfse',
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    apiUrl: 'http://localhost:8080',
  },
});