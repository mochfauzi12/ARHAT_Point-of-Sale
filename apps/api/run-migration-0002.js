const postgres = require('postgres');
require('dotenv').config();

async function run() {
  const sql = postgres(process.env.DATABASE_URL);
  
  const migration = `
CREATE TABLE IF NOT EXISTS "whatsapp_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transaction_id" uuid,
	"customer_id" uuid,
	"recipient_phone" varchar(50) NOT NULL,
	"message_type" varchar(50) NOT NULL,
	"content" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"provider_message_id" varchar(255),
	"error_message" text,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
  `;
  
  try {
    console.log('Running migration...');
    await sql.unsafe(migration);
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

run();
