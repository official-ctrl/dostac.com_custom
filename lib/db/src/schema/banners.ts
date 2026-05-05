import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  titleKo: varchar("title_ko", { length: 200 }).notNull().default(""),
  titleEn: varchar("title_en", { length: 200 }).notNull().default(""),
  titleJa: varchar("title_ja", { length: 200 }).notNull().default(""),
  titleZh: varchar("title_zh", { length: 200 }).notNull().default(""),
  titleVi: varchar("title_vi", { length: 200 }).notNull().default(""),
  descriptionKo: text("description_ko").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionJa: text("description_ja").notNull().default(""),
  descriptionZh: text("description_zh").notNull().default(""),
  descriptionVi: text("description_vi").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertBannerSchema = createInsertSchema(bannersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof bannersTable.$inferSelect;
