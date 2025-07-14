"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { t, Lang } from "@/utils/i18n";
import { NotebookText, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";

type Props = {
  title: string;
  description: string;
  sectionNumber: number;
  unitNumber: number;
  colors: string[];
  flagSrc?: string | null;
  lang?: Lang;
};

export const UnitBanner = ({
  title,
  description,
  sectionNumber,
  unitNumber,
  colors,
  flagSrc,
  lang = "en",
}: Props) => {
  const isStripe = colors.length === 3 && !flagSrc;
  const backgroundStyle = isStripe
    ? {
        background: `linear-gradient(180deg, ${colors[0]} 0%, ${colors[0]} 33.33%, ${colors[1]} 33.33%, ${colors[1]} 66.66%, ${colors[2]} 66.66%, ${colors[2]} 100%)`,
      }
    : flagSrc
    ? undefined
    : { background: colors.length > 1 ? `linear-gradient(135deg, ${colors.join(', ')})` : colors[0] };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={backgroundStyle}
      className="w-full rounded-[36px] shadow-[0_6px_20px_rgba(0,0,0,0.3)] relative overflow-hidden px-8 py-10 text-white flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between backdrop-blur-sm"
    >
      {/* bandeira animada */}
      {flagSrc && (
        <>
          <div
            className="absolute -inset-10 scale-125 rounded-[36px] pointer-events-none object-cover"
            style={{
              backgroundImage: `url(${flagSrc})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              animation: "flag-wave 8s linear infinite alternate",
              transform: "translateZ(0)",
            }}
          />
          <style jsx global>{`
            @keyframes flag-wave {
              0% {
                background-position-x: 0%;
              }
              100% {
                background-position-x: -100%;
              }
            }
          `}</style>
        </>
      )}
      {/* gloss highlight */}
      <span className="pointer-events-none absolute inset-0 rounded-[36px] before:absolute before:inset-0 before:rounded-[36px] before:bg-white/10 before:backdrop-blur-sm before:opacity-0 hover:before:opacity-20 before:transition-opacity" />
      <span className="pointer-events-none absolute inset-0 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity" />
      <div className="space-y-1.5 z-10">
        <p className="flex items-center gap-1 text-xs lg:text-sm uppercase font-extrabold text-white/80 tracking-wide mb-1">
          <Link href="/courses" className="-ml-1 inline-flex items-center"><ArrowLeft size={14} strokeWidth={3} className="text-white/80 hover:text-white" /></Link>
          <LanguageSwitcher current={lang} />
          <span>
            {t("section", lang)} {sectionNumber}, {t("unit", lang)} {unitNumber}
          </span>
        </p>
        <h3 className="font-bold text-base lg:text-lg">
          {description}
        </h3>
      </div>
      <Link href="/lesson" className="z-10">
        <Button
          size="lg"
          variant="ghost"
          className="hidden xl:flex font-bold text-white border-[2px] border-black/30 backdrop-blur-sm hover:bg-white/15 rounded-full px-6 py-3 uppercase tracking-wider gap-2 text-sm shadow-md"
        >
          <NotebookText className="mr-2" />
          {t("guide", lang)}
        </Button>
      </Link>
    </motion.div>
  );
};
