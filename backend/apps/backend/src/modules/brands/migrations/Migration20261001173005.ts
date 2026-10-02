import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261001173005 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "writer" drop constraint if exists "writer_slug_unique";`);
    this.addSql(`alter table if exists "publisher" drop constraint if exists "publisher_slug_unique";`);
    this.addSql(`create table if not exists "publisher" ("id" text not null, "slug" text not null, "name" text not null, "description" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "publisher_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_publisher_slug_unique" ON "publisher" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_publisher_deleted_at" ON "publisher" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "writer" ("id" text not null, "slug" text not null, "name" text not null, "bio" text[] not null, "avatar_url" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "writer_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_writer_slug_unique" ON "writer" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_writer_deleted_at" ON "writer" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "publisher" cascade;`);

    this.addSql(`drop table if exists "writer" cascade;`);
  }

}
