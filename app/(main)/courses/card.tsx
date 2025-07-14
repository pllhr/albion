import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  id: number;
  imageSrc: string;
  onClick: (id: number) => void;
  learnersCount?: string;
  disabled?: boolean;
  active?: boolean;
};

export const Card = ({
  title,
  id,
  imageSrc,
  disabled,
  onClick,
  active,
}: Props) => {
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 5, rotateY: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onClick(id)}
      className={cn(
        "group relative h-full rounded-2xl border border-white/30 bg-white/30 backdrop-blur-md shadow transition-all duration-300 ease-out overflow-hidden cursor-pointer flex flex-col items-center justify-between p-4 pb-7 min-h-[230px] min-w-[190px] hover:shadow-2xl hover:-translate-y-1 hover:border-sky-400/60 active:scale-95",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="min-[24px] w-full flex items-center justify-end">
        {active && (
          <div className="rounded-md bg-green-500 flex items-center justify-center p-1.5">
            <Check className="text-white stroke-[4] h-4 w-4" />
          </div>
        )}
      </div>
      <div className="relative w-full aspect-[3/4] mb-4">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="rounded-xl object-cover drop-shadow-md border border-white/20"
        />
      </div>
      <p className="text-neutral-700 text-center font-bold mt-3">{title}</p>
    </motion.div>
  );
};
