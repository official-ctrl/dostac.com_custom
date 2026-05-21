import { pgTable, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";

export const mediaUploadsTable = pgTable("media_uploads", {
  id: text("id").primaryKey(),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  data: text("data").notNull(),
  size: integer("size").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MediaUpload = typeof mediaUploadsTable.$inferSelect;
