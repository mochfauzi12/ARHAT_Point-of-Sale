import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models';
import 'dotenv/config';

let client: postgres.Sql<{}>;
const DUMMY_URL = "postgresql://dummy:dummy@dummy/dummy";

try {
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("CRITICAL WARNING: DATABASE_URL is missing in environment variables!");
    connectionString = DUMMY_URL;
  }
  
  client = postgres(connectionString, { prepare: false });
} catch (err: any) {
  console.error("CRITICAL ERROR: Failed to parse DATABASE_URL. Is the URL format correct?", err.message);
  client = postgres(DUMMY_URL, { prepare: false });
}

export const db = drizzle(client, { schema });
