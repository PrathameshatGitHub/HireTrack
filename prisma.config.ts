import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Load .env file so DATABASE_URL is available
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});
