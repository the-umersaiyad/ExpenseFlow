import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";
import { sql } from "drizzle-orm";

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  console.log("Running manual migration...");
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "recurring_transactions" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "category_id" integer,
      "amount" integer NOT NULL,
      "type" text NOT NULL,
      "frequency" text NOT NULL,
      "status" text DEFAULT 'active' NOT NULL,
      "start_date" timestamp NOT NULL,
      "last_processed_date" timestamp,
      "next_processed_date" timestamp NOT NULL,
      "notes" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    DO $$ BEGIN
     ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
     WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
     ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
     WHEN duplicate_object THEN null;
    END $$;
  `);
  
  console.log("Migrations complete!");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("Migration failed!", err);
  process.exit(1);
});
