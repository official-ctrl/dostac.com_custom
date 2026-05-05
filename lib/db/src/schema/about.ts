import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export interface HistoryItem {
  year: string;
  textKo: string;
  textEn: string;
  textJa: string;
  textZh: string;
  textVi: string;
}

export interface WorldwideItem {
  imageUrl: string | null;
  region: string;
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

export const aboutContentTable = pgTable("about_content", {
  id: serial("id").primaryKey(),
  greetingImageUrl: text("greeting_image_url"),
  greetingMessageKo: text("greeting_message_ko").notNull().default(""),
  greetingMessageEn: text("greeting_message_en").notNull().default(""),
  greetingMessageJa: text("greeting_message_ja").notNull().default(""),
  greetingMessageZh: text("greeting_message_zh").notNull().default(""),
  greetingMessageVi: text("greeting_message_vi").notNull().default(""),
  greetingSignatureKo: text("greeting_signature_ko").notNull().default(""),
  greetingSignatureEn: text("greeting_signature_en").notNull().default(""),
  greetingSignatureJa: text("greeting_signature_ja").notNull().default(""),
  greetingSignatureZh: text("greeting_signature_zh").notNull().default(""),
  greetingSignatureVi: text("greeting_signature_vi").notNull().default(""),
  historyItems: jsonb("history_items")
    .$type<HistoryItem[]>()
    .notNull()
    .default([]),
  worldwideImageUrl: text("worldwide_image_url"),
  worldwideIntroKo: text("worldwide_intro_ko").notNull().default(""),
  worldwideIntroEn: text("worldwide_intro_en").notNull().default(""),
  worldwideIntroJa: text("worldwide_intro_ja").notNull().default(""),
  worldwideIntroZh: text("worldwide_intro_zh").notNull().default(""),
  worldwideIntroVi: text("worldwide_intro_vi").notNull().default(""),
  worldwideItems: jsonb("worldwide_items")
    .$type<WorldwideItem[]>()
    .notNull()
    .default([]),
  directionsAddressKo: text("directions_address_ko").notNull().default(""),
  directionsAddressEn: text("directions_address_en").notNull().default(""),
  directionsAddressJa: text("directions_address_ja").notNull().default(""),
  directionsAddressZh: text("directions_address_zh").notNull().default(""),
  directionsAddressVi: text("directions_address_vi").notNull().default(""),
  directionsMapEmbed: text("directions_map_embed"),
  directionsImageUrl: text("directions_image_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type AboutContent = typeof aboutContentTable.$inferSelect;
