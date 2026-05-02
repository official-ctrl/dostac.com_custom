import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactInquiriesTable = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 200 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 60 }).notNull().default(""),
  country: varchar("country", { length: 80 }).notNull().default(""),
  projectType: varchar("project_type", { length: 30 }).notNull().default(""),
  productInterest: text("product_interest").array().notNull().default([]),
  monthlyVolume: varchar("monthly_volume", { length: 60 }).notNull().default(""),
  message: text("message").notNull().default(""),
  status: varchar("status", { length: 20 }).notNull().default("new"),
  adminNote: text("admin_note").notNull().default(""),
  source: varchar("source", { length: 30 }).notNull().default("web"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertContactInquirySchema = createInsertSchema(contactInquiriesTable).omit({
  id: true,
  status: true,
  adminNote: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;
export type ContactInquiry = typeof contactInquiriesTable.$inferSelect;
