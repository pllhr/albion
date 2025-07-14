"use client";
import { useTransition, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { updateUiLanguage } from "@/app/actions/update-ui-language";
import { useRouter } from "next/navigation";

interface Props {
  courseId: number;
  open: boolean;
  defaultLang: "de" | "en" | "pt" | null;
}

export const LanguagePickerModal = ({ courseId, open, defaultLang }: Props) => {
  const [lang, setLang] = useState<"de" | "en" | "pt">(defaultLang ?? "de");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const confirm = () => {
    startTransition(async () => {
      await updateUiLanguage(courseId, lang);
      router.refresh();
    });
  };

  return (
    <Dialog.Root open={open}>    
      <Dialog.Portal>      
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm rounded-2xl bg-white p-6 flex flex-col gap-4">
          <Dialog.Title className="text-lg font-bold mb-2">Escolha o idioma da interface</Dialog.Title>
          <fieldset className="flex flex-col gap-2">
            {(["de","en","pt"] as const).map(code => (
              <label key={code} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lang"
                  value={code}
                  checked={lang === code}
                  onChange={() => setLang(code)}
                  className="h-4 w-4 accent-blue-600"
                />
                {code === "de" && "Alemão (primário)"}
                {code === "en" && "Inglês (secundário)"}
                {code === "pt" && "Português (terciário)"}
              </label>
            ))}
          </fieldset>
          <button
            disabled={pending}
            onClick={confirm}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >Confirmar</button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
