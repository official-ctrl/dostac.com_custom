import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  boolean,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  category: varchar("category", { length: 60 }).notNull().default("general"),
  subCategory: varchar("sub_category", { length: 80 }).notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  imageUrl: text("image_url"),
  certs: jsonb("certs").$type<string[]>().notNull().default([]),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const productTranslationsTable = pgTable(
  "product_translations",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    lang: varchar("lang", { length: 4 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    headline: varchar("headline", { length: 300 }).notNull().default(""),
    valueProp: varchar("value_prop", { length: 300 }).notNull().default(""),
    body: text("body").notNull().default(""),
    features: text("features").notNull().default(""),
    material: text("material").notNull().default(""),
  },
  (t) => ({
    uq: uniqueIndex("product_translations_product_lang_uq").on(t.productId, t.lang),
  }),
);

export const insertProductTranslationSchema = createInsertSchema(
  productTranslationsTable,
).omit({ id: true });
export type InsertProductTranslation = z.infer<typeof insertProductTranslationSchema>;
export type ProductTranslation = typeof productTranslationsTable.$inferSelect;

export const categoryTranslationsTable = pgTable("category_translations", {
  slug: varchar("slug", { length: 80 }).primaryKey(),
  nameKo: varchar("name_ko", { length: 120 }).notNull().default(""),
  nameEn: varchar("name_en", { length: 120 }).notNull().default(""),
  nameJa: varchar("name_ja", { length: 120 }).notNull().default(""),
  nameZh: varchar("name_zh", { length: 120 }).notNull().default(""),
  nameVi: varchar("name_vi", { length: 120 }).notNull().default(""),
});

export type CategoryTranslationRow = typeof categoryTranslationsTable.$inferSelect;

export const subCategoryTranslationsTable = pgTable("sub_category_translations", {
  slug: varchar("slug", { length: 80 }).primaryKey(),
  nameKo: varchar("name_ko", { length: 120 }).notNull().default(""),
  nameEn: varchar("name_en", { length: 120 }).notNull().default(""),
  nameJa: varchar("name_ja", { length: 120 }).notNull().default(""),
  nameZh: varchar("name_zh", { length: 120 }).notNull().default(""),
  nameVi: varchar("name_vi", { length: 120 }).notNull().default(""),
});

export type SubCategoryTranslationRow = typeof subCategoryTranslationsTable.$inferSelect;
