CREATE TABLE "discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" varchar(255),
	"type" varchar(50) DEFAULT 'fixed' NOT NULL,
	"value" varchar(20) NOT NULL,
	"min_purchase_amount" varchar(20) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_discounts_code" ON "discounts" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_discounts_tenant_code" ON "discounts" USING btree ("tenant_id","code");