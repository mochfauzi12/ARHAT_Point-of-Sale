CREATE INDEX "idx_customers_phone" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_transactions_number" ON "transactions" USING btree ("transaction_number");--> statement-breakpoint
CREATE INDEX "idx_transactions_created_at" ON "transactions" USING btree ("created_at");