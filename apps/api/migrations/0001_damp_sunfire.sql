CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"points" varchar(20) DEFAULT '0',
	"total_spent" varchar(20) DEFAULT '0',
	"notes" varchar(1000),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_modifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" varchar(20) DEFAULT '0',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100),
	"price" varchar(20) NOT NULL,
	"stock_quantity" varchar(10) DEFAULT '0',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cashier_id" uuid NOT NULL,
	"outlet_id" uuid,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"starting_cash" varchar(20) NOT NULL,
	"actual_ending_cash" varchar(20),
	"expected_ending_cash" varchar(20),
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"notes" varchar(1000)
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
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
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "image_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "outlets" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "outlets" ADD COLUMN "tax_rate" varchar(10) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "outlets" ADD COLUMN "receipt_footer" varchar(500);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_service" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD COLUMN "variant_id" uuid;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD COLUMN "variant_name" varchar(255);--> statement-breakpoint
ALTER TABLE "transaction_items" ADD COLUMN "modifiers" varchar(1000);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "shift_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "points_earned" varchar(20) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "points_redeemed" varchar(20) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_modifiers" ADD CONSTRAINT "product_modifiers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_outlet_id_outlets_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."outlets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;