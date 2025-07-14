import de from "@/locales/de.json";
import en from "@/locales/en.json";
import pt from "@/locales/pt.json";

export type Lang = "de" | "en" | "pt";

const dict = { de, en, pt } as const;

export function t(key: string, lang: Lang) {
  return (dict[lang] as Record<string, string>)[key] ?? key;
}
