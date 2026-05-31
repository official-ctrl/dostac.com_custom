import { openai } from "./openai-client";

export type SupportedLang = "ko" | "en" | "ja" | "zh" | "vi";
export const SUPPORTED_LANGS: SupportedLang[] = ["ko", "en", "ja", "zh", "vi"];

const LANG_LABEL: Record<SupportedLang, string> = {
  ko: "Korean (한국어)",
  en: "English",
  ja: "Japanese (日本語)",
  zh: "Simplified Chinese (简体中文)",
  vi: "Vietnamese (Tiếng Việt)",
};

export async function translateText(args: {
  sourceText: string;
  sourceLang: SupportedLang;
  targetLang: SupportedLang;
  context?: string;
  format?: "text" | "html";
}): Promise<string> {
  const { sourceText, sourceLang, targetLang, context, format = "text" } = args;
  if (sourceLang === targetLang) return sourceText;
  if (!sourceText.trim()) return "";

  const systemPrompt =
    `You are a professional ${LANG_LABEL[sourceLang]} → ${LANG_LABEL[targetLang]} translator ` +
    `for a Korean cosmetics ODM/OEM B2B company website (DOSTAC). ` +
    `Translate naturally and concisely. Keep brand names, product code names, and proper nouns as-is. ` +
    (format === "html"
      ? "The input is HTML. Return HTML preserving all tags, attributes, and structure exactly. Translate only the visible text. "
      : "Return plain text. ") +
    (context ? `Context: ${context}. ` : "") +
    `Return ONLY the translation with no commentary, no quotes, no markdown fences.`;

  const completion = await openai.chat.completions.create({
    model: process.env["OPENAI_MODEL"] ?? "gpt-4o-mini",
    max_completion_tokens: 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: sourceText },
    ],
  });

  const out = completion.choices[0]?.message?.content?.trim() ?? "";
  return out;
}
