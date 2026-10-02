import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261001173007 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "cancellation_request" drop constraint if exists "cancellation_request_order_id_unique";`);
    this.addSql(`create table if not exists "cancellation_request" ("id" text not null, "order_id" text not null, "customer_id" text not null, "status" text check ("status" in ('requested', 'approved', 'rejected')) not null default 'requested', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "cancellation_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_cancellation_request_order_id_unique" ON "cancellation_request" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cancellation_request_customer_id" ON "cancellation_request" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cancellation_request_deleted_at" ON "cancellation_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "cancellation_request" cascade;`);
  }

}
