import Image from "next/image";
import { useCallback } from "react";
import { useAudio, useKey } from "react-use";

import { cn } from "@/lib/utils";
import { challenges } from "@/db/schema";

type Props = {
  id: number;
  imageSrc: string | null;
  audioSrc: string | null;
  text: string;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  status?: "correct" | "wrong" | "none",
  type: typeof challenges.$inferSelect["type"];
};

export const Card = ({
  id,
  imageSrc,
  audioSrc,
  text,
  shortcut,
  selected,
  onClick,
  status,
  disabled,
  type,
}: Props) => {
  // mapeia texto -> arquivo de áudio quando coluna audioSrc estiver vazia
  const fallbackMap: Record<string, string> = {
    tchau: "/tschuss.mp3",
    "tchau!": "/tschuss.mp3",
    obrigado: "/danke.mp3",
    "obrigado!": "/danke.mp3",
  };
  const computedSrc = audioSrc || fallbackMap[text.toLowerCase()];

  const [audio, _, controls] = useAudio({ src: computedSrc || "" });

  const handleClick = useCallback(() => {
    if (disabled || status === "correct") return;

    controls.seek(0);
    controls.play();
    onClick();
  }, [disabled, status, onClick, controls]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "h-full border-2 rounded-xl border-b-2 hover:bg-black/5 px-1 py-1 lg:px-2 lg:py-2 cursor-pointer",
        selected && "border-sky-300 bg-sky-100 hover:bg-sky-100 scale-105 animate-[bounce_0.5s_ease-out] -translate-y-[73px] opacity-80 transition-all duration-700 ease-out",
        selected && status === "correct" 
          && "border-green-300 bg-green-100 hover:bg-green-100",
        selected && status === "wrong" 
          && "border-rose-300 bg-rose-100 hover:bg-rose-100",
        disabled && "pointer-events-none hover:bg-white",
        type === "ASSIST" && "w-full"
      )}
    >
      {audio}
      {imageSrc && (
        <div
          className="relative aspect-square mb-4 max-h-[120px] lg:max-h-[220px] w-full"
        >
          <Image src={imageSrc} fill alt={text} />
        </div>
      )}
      <div className={cn(
        "flex items-center gap-1",
        type === "ASSIST" && "flex-row-reverse",
      )}>
        {type === "ASSIST" && <div />}
        <p className={cn(
          "text-neutral-600 text-sm lg:text-base",
          selected && "text-sky-500",
          selected && status === "correct" 
            && "text-green-500",
          selected && status === "wrong" 
            && "text-rose-500",
        )}>
          {text}
        </p>
        <div className={cn(
          "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-2 flex items-center justify-center rounded-lg text-neutral-400 lg:text-[15px] text-xs font-semibold",
          selected && "border-sky-300 text-sky-500",
          selected && status === "correct" 
            && "border-green-500 text-green-500",
          selected && status === "wrong" 
            && "border-rose-500 text-rose-500",
        )}>
          {shortcut}
        </div>
      </div>
    </div>
  );
};
