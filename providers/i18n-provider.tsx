"use client";
import { createContext, useContext, useMemo } from "react";
import { Lang, t as baseT } from "@/utils/i18n";

const I18nContext = createContext<Lang>("en");

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <I18nContext.Provider value={lang}>{children}</I18nContext.Provider>;
}

export function useT() {
  const lang = useContext(I18nContext);
  const translator = useMemo(() => {
    return (key: string) => baseT(key, lang);
  }, [lang]);

  return translator;
}
