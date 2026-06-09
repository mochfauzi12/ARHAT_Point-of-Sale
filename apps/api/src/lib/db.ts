import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models';
import 'dotenv/config';

let client: any;
const DUMMY_URL = "postgresql://dummy:dummy@dummy/dummy";

try {
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("CRITICAL WARNING: DATABASE_URL is missing in environment variables!");
    connectionString = DUMMY_URL;
  }
  
  // If esbuild imports postgres as an object with default, we need to handle it
  const pgFn = typeof postgres === 'function' ? postgres : (postgres as any).default || postgres;
  client = pgFn(connectionString, { prepare: false, ssl: 'require' });
} catch (e) {
  console.error("Failed to initialize postgres client:", e);
  // Do not try to initialize again to prevent a fatal crash
  client = null;
}

export const db = client ? drizzle(client, { schema }) : null as any;
