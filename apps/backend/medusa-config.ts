import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

export default defineConfig({
  projectConfig: {
    databaseUrl:
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres_secure_password@localhost:5432/medusa_db',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:9000,http://localhost:3000',
      authCors: process.env.AUTH_CORS || 'http://localhost:3000',
      jwtSecret:
        process.env.JWT_SECRET || 'super_secret_jwt_key_minimum_32_characters',
      cookieSecret:
        process.env.COOKIE_SECRET || 'super_secret_cookie_key_minimum_32_characters',
    },
  },
  modules: [
    {
      resolve: './src/modules/wishlist',
    },
  ],
  admin: {
    disable: false,
  },
});

