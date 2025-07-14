"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeOption = "light" | "sepia" | "dark";
export type FontFamilyOption = "serif" | "sans" | "mono";
export type ToolType = "cursor" | "highlight" | "pen" | "eraser";

interface ReaderSettings {
  theme: ThemeOption;
  font: FontFamilyOption;
  tool: ToolType;
  color: string; // for highlight/pen
  setTheme: (t: ThemeOption) => void;
  setFont: (f: FontFamilyOption) => void;
  setTool: (t: ToolType) => void;
  setColor: (c: string) => void;
}

const ReaderSettingsContext = createContext<ReaderSettings | null>(null);

export function useReaderSettings() {
  const ctx = useContext(ReaderSettingsContext);
  if (!ctx) throw new Error("useReaderSettings must be inside provider");
  return ctx;
}

const LS_KEY = "reader_settings";

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>("light");
  const [font, setFontState] = useState<FontFamilyOption>("serif");
  const [tool, setToolState] = useState<ToolType>("cursor");
  const [color, setColorState] = useState<string>("#fef08a"); // default yellow highlight

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThemeState(parsed.theme ?? "light");
        setFontState(parsed.font ?? "serif");
        setToolState(parsed.tool ?? "cursor");
        setColorState(parsed.color ?? "#fef08a");
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ theme, font, tool, color })
      );
    }
  }, [theme, font, tool, color]);

  const value: ReaderSettings = {
    theme,
    font,
    tool,
    color,
    setTheme: setThemeState,
    setFont: setFontState,
    setTool: setToolState,
    setColor: setColorState,
  };

  return (
    <ReaderSettingsContext.Provider value={value}>{children}</ReaderSettingsContext.Provider>
  );
}
