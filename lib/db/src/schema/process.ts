import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export interface OemStep {
  titleKo: string;
  titleEn: string;
  titleJa: string;
  titleZh: string;
  titleVi: string;
  descriptionKo: string;
  descriptionEn: string;
  descriptionJa: string;
  descriptionZh: string;
  descriptionVi: string;
}

export interface CertItem {
  imageUrl: string | null;
  code: string;
  nameKo: string;
  nameEn: string;
  nameJa: string;
  nameZh: string;
  nameVi: string;
  descriptionKo: string;
  descriptionEn: string;
  descriptionJa: string;
  descriptionZh: string;
  descriptionVi: string;
}

export const processContentTable = pgTable("process_content", {
  id: serial("id").primaryKey(),
  oemImageUrl: text("oem_image_url"),
  oemDescriptionKo: text("oem_description_ko").notNull().default(""),
  oemDescriptionEn: text("oem_description_en").notNull().default(""),
  oemDescriptionJa: text("oem_description_ja").notNull().default(""),
  oemDescriptionZh: text("oem_description_zh").notNull().default(""),
  oemDescriptionVi: text("oem_description_vi").notNull().default(""),
  oemSteps: jsonb("oem_steps").$type<OemStep[]>().notNull().default([]),
  certIntroKo: text("cert_intro_ko").notNull().default(""),
  certIntroEn: text("cert_intro_en").notNull().default(""),
  certIntroJa: text("cert_intro_ja").notNull().default(""),
  certIntroZh: text("cert_intro_zh").notNull().default(""),
  certIntroVi: text("cert_intro_vi").notNull().default(""),
  certItems: jsonb("cert_items").$type<CertItem[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ProcessContent = typeof processContentTable.$inferSelect;
