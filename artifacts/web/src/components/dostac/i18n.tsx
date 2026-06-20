"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getListPublicCategoryTranslationsQueryOptions,
  getListPublicSubCategoryTranslationsQueryOptions,
} from "@workspace/api-client-react";

/* English bundled by default — keeps SSR fast + zero-flicker for EN users.
   Korean / Japanese / Chinese / Vietnamese are lazy-loaded on first use. */
import { en } from "./locales/en";
import type { Dict } from "./locales/en";

export type Lang = "ko" | "en" | "ja" | "zh" | "vi";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "ko", label: "한국어",        flag: "KR" },
  { code: "en", label: "English",       flag: "US" },
  { code: "ja", label: "日本語",         flag: "JP" },
  { code: "zh", label: "中文",          flag: "CN" },
  { code: "vi", label: "Tiếng Việt",    flag: "VN" },
];

/* Runtime cache of loaded dictionaries.
   en is always present; others fill in after their dynamic import resolves. */
const dictCache: Partial<Record<Lang, Dict>> = { en };

/* Dynamic loader — each lang ends up in its own webpack/turbopack chunk.
   Re-entrant: subsequent calls return cached value. */
async function loadDict(lang: Lang): Promise<Dict> {
  const cached = dictCache[lang];
  if (cached) return cached;
  let mod: Dict;
  switch (lang) {
    case "ko": mod = (await import("./locales/ko")).ko; break;
    case "ja": mod = (await import("./locales/ja")).ja; break;
    case "zh": mod = (await import("./locales/zh")).zh; break;
    case "vi": mod = (await import("./locales/vi")).vi; break;
    case "en":
    default:   mod = en;
  }
  dictCache[lang] = mod;
  return mod;
}

function resolve(dict: Dict | undefined, path: string): unknown {
  if (!dict) return path;
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur == null) return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur === undefined ? path : cur;
}

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => unknown;
}

const LanguageContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  /* Always start with "en" on both server + client — prevents hydration mismatch.
     After mount, read localStorage and switch to saved language (triggers lazy load). */
  const [lang, setLangState] = useState<Lang>("en");
  /* Force re-render when an async dict finishes loading */
  const [, setDictsVersion] = useState(0);

  useEffect(() => {
    const VALID: Lang[] = ["ko", "en", "ja", "zh", "vi"];
    const saved = window.localStorage.getItem("dostac-lang-v2") as Lang | null;
    if (saved && VALID.includes(saved) && saved !== "en") {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem("dostac-lang-v2", lang);
    /* Trigger lazy load if not yet cached */
    if (dictCache[lang]) return;
    let cancelled = false;
    loadDict(lang).then(() => {
      if (!cancelled) setDictsVersion((v) => v + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback(
    (key: string): unknown => resolve(dictCache[lang] ?? en, key),
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Translate a key for an explicit lang. May return the key itself if dict not yet loaded. */
export function tFor(lang: Lang, key: string): unknown {
  return resolve(dictCache[lang] ?? en, key);
}

export function useT(): LangContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: "en",
      setLang: () => {},
      t: (key: string) => resolve(en, key),
    };
  }
  return ctx;
}

export function useLang(): { lang: Lang; setLang: (l: Lang) => void } {
  const { lang, setLang } = useT();
  return { lang, setLang };
}

/** Returns the category key unchanged. All values in the DB are already slugs. */
export function normalizeCategory(key: string): string {
  return key;
}

/** Returns the sub-category key unchanged. All values in the DB are already slugs. */
export function normalizeSubCategory(key: string): string {
  return key;
}

const LANG_TO_NAME_KEY: Record<Lang, "nameKo" | "nameEn" | "nameJa" | "nameZh" | "nameVi"> = {
  ko: "nameKo",
  en: "nameEn",
  ja: "nameJa",
  zh: "nameZh",
  vi: "nameVi",
};

const TRANSLATION_STALE_TIME = 10 * 60 * 1000;

export function useCategoryLabel(): (key: string | null | undefined) => string {
  const { lang } = useLang();
  const { data: apiRows } = useQuery({
    ...getListPublicCategoryTranslationsQueryOptions(),
    staleTime: TRANSLATION_STALE_TIME,
  });
  const nameKey = LANG_TO_NAME_KEY[lang];
  return useCallback(
    (key: string | null | undefined) => {
      if (!key) return key ?? "";
      if (apiRows) {
        const row = apiRows.find((r) => r.slug === key);
        const apiName = row ? (row[nameKey] as string | undefined) : undefined;
        if (apiName && apiName.trim()) return apiName;
      }
      return key;
    },
    [lang, apiRows, nameKey],
  );
}

export function useSubCategoryLabel(): (key: string | null | undefined) => string {
  const { lang } = useLang();
  const { data: apiRows } = useQuery({
    ...getListPublicSubCategoryTranslationsQueryOptions(),
    staleTime: TRANSLATION_STALE_TIME,
  });
  const nameKey = LANG_TO_NAME_KEY[lang];
  return useCallback(
    (key: string | null | undefined) => {
      if (!key) return key ?? "";
      if (apiRows) {
        const row = apiRows.find((r) => r.slug === key);
        const apiName = row ? (row[nameKey] as string | undefined) : undefined;
        if (apiName && apiName.trim()) return apiName;
      }
      return key;
    },
    [lang, apiRows, nameKey],
  );
}
