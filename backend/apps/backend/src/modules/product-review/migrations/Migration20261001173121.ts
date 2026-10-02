import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261001173121 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "review" ("id" text not null, "product_id" text not null, "customer_id" text null, "first_name" text not null, "last_name" text not null, "content" text not null, "rating" integer not null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'approved', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"), constraint review_rating_check check (rating >= 1 AND rating <= 5), constraint review_content_length_check check (char_length(content) BETWEEN 1 AND 100));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_product_id" ON "review" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "review" cascade;`);
  }

}
