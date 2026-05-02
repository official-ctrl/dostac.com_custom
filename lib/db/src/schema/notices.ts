import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const noticesTable = pgTable("notices", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 30 }).notNull().default("company"),
  region: varchar("region", { length: 80 }).notNull().default(""),
  thumbnailUrl: text("thumbnail_url"),
  published: boolean("published").notNull().default(true),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertNoticeSchema = createInsertSchema(noticesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Notice = typeof noticesTable.$inferSelect;

export const noticeTranslationsTable = pgTable(
  "notice_translations",
  {
    id: serial("id").primaryKey(),
    noticeId: integer("notice_id").notNull(),
    lang: varchar("lang", { length: 4 }).notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    excerpt: text("excerpt").notNull().default(""),
    body: text("body").notNull().default(""),
  },
  (t) => ({
    uq: uniqueIndex("notice_translations_notice_lang_uq").on(t.noticeId, t.lang),
  }),
);

export const insertNoticeTranslationSchema = createInsertSchema(
  noticeTranslationsTable,
).omit({ id: true });
export type InsertNoticeTranslation = z.infer<typeof insertNoticeTranslationSchema>;
export type NoticeTranslation = typeof noticeTranslationsTable.$inferSelect;
