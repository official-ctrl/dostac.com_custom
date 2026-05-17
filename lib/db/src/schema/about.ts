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

export interface PhilosophyCard {
  titleKo: string;
  titleEn: string;
  titleJa: string;
  titleZh: string;
  titleVi: string;
  textKo: string;
  textEn: string;
  textJa: string;
  textZh: string;
  textVi: string;
}

export interface WhyDostacItem {
  titleKo: string;
  titleEn: string;
  titleJa: string;
  titleZh: string;
  titleVi: string;
  descKo: string;
  descEn: string;
  descJa: string;
  descZh: string;
  descVi: string;
  active: boolean;
  sortOrder: number;
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
  companyDescKo: text("company_desc_ko").notNull().default(""),
  companyDescEn: text("company_desc_en").notNull().default(""),
  companyDescJa: text("company_desc_ja").notNull().default(""),
  companyDescZh: text("company_desc_zh").notNull().default(""),
  companyDescVi: text("company_desc_vi").notNull().default(""),
  philosophyImageUrl: text("philosophy_image_url"),
  philosophyHeadingKo: text("philosophy_heading_ko").notNull().default(""),
  philosophyHeadingEn: text("philosophy_heading_en").notNull().default(""),
  philosophyHeadingJa: text("philosophy_heading_ja").notNull().default(""),
  philosophyHeadingZh: text("philosophy_heading_zh").notNull().default(""),
  philosophyHeadingVi: text("philosophy_heading_vi").notNull().default(""),
  philosophyIntroKo: text("philosophy_intro_ko").notNull().default(""),
  philosophyIntroEn: text("philosophy_intro_en").notNull().default(""),
  philosophyIntroJa: text("philosophy_intro_ja").notNull().default(""),
  philosophyIntroZh: text("philosophy_intro_zh").notNull().default(""),
  philosophyIntroVi: text("philosophy_intro_vi").notNull().default(""),
  philosophyCards: jsonb("philosophy_cards")
    .$type<PhilosophyCard[]>()
    .notNull()
    .default([]),
  whyDostacItems: jsonb("why_dostac_items")
    .$type<WhyDostacItem[]>()
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
