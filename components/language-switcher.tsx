"use client";

import * as Popover from "@radix-ui/react-popover";
import { Settings, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { updateUiLanguage } from "@/app/actions/update-ui-language";
import { useRouter } from "next/navigation";

const LANGS: { code: "de" | "en" | "pt"; label: string }[] = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];

interface Props {
  current: "de" | "en" | "pt";
}

export const LanguageSwitcher = ({ current }: Props) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const choose = (code: "de" | "en" | "pt") => {
    startTransition(async () => {
      try {
        await updateUiLanguage(0, code); // courseId não é utilizado na action
        router.refresh();
      } catch (e) {
        console.error(e);
      }
      setOpen(false);
    });
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="inline-flex items-center justify-center text-white/80 hover:text-white transition focus:outline-none"
          aria-label="Trocar idioma da interface"
        >
          <Settings size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="rounded-xl shadow-lg bg-white p-3 border w-36 z-50"
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              disabled={isPending}
              onClick={() => choose(l.code)}
              className="flex items-center w-full text-sm text-neutral-700 hover:bg-neutral-100 rounded-md px-2 py-1 gap-2"
            >
              {l.label}
              {current === l.code && <Check size={14} className="text-green-600 ml-auto" />}
            </button>
          ))}
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}; 