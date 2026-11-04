import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    env: {
      NODE_ENV: 'test',
      PORT: '5000',
      DATABASE_URL: 'mysql://root:password@127.0.0.1:3306/digiamplify_test',
      CLIENT_URL: 'http://localhost:5173,http://localhost:5174',
      JWT_ACCESS_SECRET: 'test-access-secret-at-least-16',
      JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-16',
      ACCESS_TOKEN_EXPIRES: '15m',
      REFRESH_TOKEN_EXPIRES_DAYS: '7',
      TRUST_PROXY: '0',
    },
  },
})
