import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './drizzle/schema';

// Create a singleton pool for better performance on Vercel
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      // Optimize for serverless
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export const db = drizzle(getPool(), { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});