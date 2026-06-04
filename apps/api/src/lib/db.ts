import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models';

const connectionString = process.env.DATABASE_URL || '';

// If no DB URL is provided, it will error when queried, which is expected for now.
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
