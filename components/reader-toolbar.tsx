"use client";

import { useReaderSettings } from "@/providers/reader-settings-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { motion } from "framer-motion";

const themes = [
  { id: "light", label: "Claro" },
  { id: "sepia", label: "Sépia" },
  { id: "dark", label: "Escuro" },
];

const fonts = [
  { id: "serif", label: "Serif" },
  { id: "sans", label: "Sans" },
  { id: "mono", label: "Mono" },
];

export function ReaderToolbar() {
  const { theme, setTheme, font, setFont } = useReaderSettings();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="absolute right-4 top-4 z-20">
          <Settings2 className="w-5 h-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" className="w-64 space-y-4">
        {/* Tema */}
        <div>
          <p className="text-xs font-semibold mb-1">Tema</p>
          <div className="flex gap-2 flex-wrap">
            {themes.map((t) => (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(t.id as any)}
                className={`border rounded px-3 py-1 text-sm ${
                  theme === t.id ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                {t.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Fonte */}
        <div>
          <p className="text-xs font-semibold mb-1">Fonte</p>
          <div className="flex gap-2 flex-wrap">
            {fonts.map((f) => (
              <motion.button
                key={f.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFont(f.id as any)}
                className={`border rounded px-3 py-1 text-sm ${
                  font === f.id ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}