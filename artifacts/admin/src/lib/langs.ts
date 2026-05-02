export type Lang = "ko" | "en" | "ja" | "zh" | "vi";

export const LANGS: Lang[] = ["ko", "en", "ja", "zh", "vi"];

export const LANG_LABEL: Record<Lang, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
  vi: "Tiếng Việt",
};

export const LANG_FLAG: Record<Lang, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  ja: "🇯🇵",
  zh: "🇨🇳",
  vi: "🇻🇳",
};

export function emptyTranslations<T extends Record<string, string>>(
  shape: T,
): Array<T & { lang: Lang }> {
  return LANGS.map((lang) => ({ lang, ...shape }));
}

export function getTr<T extends { lang: Lang }>(
  list: T[] | undefined,
  lang: Lang,
): T | undefined {
  return list?.find((t) => t.lang === lang);
}
