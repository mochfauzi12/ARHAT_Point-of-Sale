import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || "postgresql://dummy:dummy@dummy/dummy";

if (!process.env.DATABASE_URL) {
  console.error("CRITICAL WARNING: DATABASE_URL is missing in environment variables!");
}

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
