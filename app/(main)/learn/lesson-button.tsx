"use client";

import Link from "next/link";
import { Crown, Star, Check } from "lucide-react";
import Image from "next/image";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";
import { useRouter } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import "react-circular-progressbar/dist/styles.css";

type Props = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  completed: boolean;
  percentage?: number;
  title: string;
  lessonNumber: number;
  totalLessons: number;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  completed,
  percentage,
  title,
  lessonNumber,
  totalLessons
}: Props) => {
  const t = useT();
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex;
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex;
  } else {
    indentationLevel = cycleIndex - 8;
  }

  const rightPosition = indentationLevel * 40;

  const isCompleted = completed;

  const isFirst = index === 0;
  const isLast = index === totalCount;
  const router = useRouter();
  

  const handleXpUpdate = async (amount: number) => {
    try {
      await fetch("/api/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
    } catch (e) {
      console.error("Não foi possível atualizar XP", e);
    }
  };

  const onPractice = async () => {
    await handleXpUpdate(5);
    router.push(`/lesson/${id}`);
  };

  const onTitans = async () => {
    await handleXpUpdate(40);
  };

  // Ícone de lição concluída com estilo "glass" premium seguindo referência (reflexo diagonal, grade sutil, anel branco)
  const CompletedIcon = () => (
    <div
      className="relative flex items-center justify-center h-full w-full select-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* sombra projetada na superfície */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[70%] h-3 rounded-full bg-black/50 opacity-30 blur-md" />

      {/* anel branco flutuante animado */}
      <div
        className="absolute inset-0 rounded-full ring-[10px] ring-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
      />

      {/* corpo principal com gradiente e sombra interna */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#5df768] to-[#1aa036] shadow-inner" />


      {/* reflexo diagonal de vidro animado */}
      <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
        <div
          className="absolute -inset-1 bg-white/25 blur-md"
          style={{
            clipPath: 'polygon(0 0,100% 0,100% 25%,0 40%)',
            transform: 'rotate(45deg)',
            animation: 'glass-reflect 4s linear infinite alternate',
          }}
        />
      </div>

      {/* brilho especular superior */}
      <div className="absolute inset-x-6 -top-1 h-4 rounded-full bg-white/60 blur-md" />

      {/* grade sutil para efeito de tela/pixel */}
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:4px_4px] mix-blend-overlay pointer-events-none" />

      {/* ícone check */}
      <Check className="relative h-8 w-8 stroke-[3] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" />
    </div>
  );

const Icon = isLast ? Crown : Star;

  const href = `/lesson/${id}`;
  
  

  // JSX comum usado em ambos os casos (Link ou button)
  const baseButtonClasses = isCompleted ? "p-0 bg-transparent border-none shadow-none" : "border-b-8";

  const content = (
    <div
      className="relative"
      style={{
        right: `${rightPosition}px`,
        marginTop: isFirst && !isCompleted ? 60 : 24,
      }}
    >
      {current ? (
        <div className="h-[102px] w-[102px] relative">
          <div className="absolute -top-8 inset-x-0 flex justify-center animate-bounce z-20 pointer-events-none">
            <div className="px-3 py-2 bg-white text-[#58cc02] font-extrabold uppercase tracking-wide rounded-xl shadow-md ring-1 ring-black/5 text-center">
            {t("start")}
            <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2" />
          </div>
          </div>
          <CircularProgressbarWithChildren
            value={Number.isNaN(percentage) ? 0 : percentage}
            styles={{
              path: {
                stroke: "#f87171",
              },
              trail: {
                stroke: "#fef2f2",
              },
            }}
          >
            <Button
              size="rounded"
              variant={locked ? "locked" : "secondary"}
              className={`group h-[70px] w-[70px] rounded-full ${baseButtonClasses} ${locked ? '' : isCompleted ? 'bg-gradient-to-b from-[#a8ffb7] to-[#34ce55] ring-4 ring-white shadow-md hover:shadow-lg' : 'bg-gradient-to-b from-[#34d058] to-[#0ea54b] ring-1 ring-black/10 shadow-lg hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1'}`}
            >
              {isCompleted ? (
                <CompletedIcon />
              ) : (
                <Icon
                  className={cn(
                    "h-10 w-10",
                    locked
                      ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                      : "fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  )}
                />
              )}
            <span className="pointer-events-none absolute inset-0 rounded-full before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity" />
            {/* reflexo de vidro */}
            <span className="absolute inset-0 pointer-events-none">
              <span
                className="absolute -inset-1 bg-white/25 blur-md"
                style={{ clipPath: 'polygon(0 0,100% 0,100% 25%,0 40%)', transform: 'rotate(45deg)', animation: 'glass-reflect 4s linear infinite alternate' }}
              />
            </span>
</Button>
          </CircularProgressbarWithChildren>
        </div>
      ) : (
        <Button
          size="rounded"
          variant={locked ? "locked" : "secondary"}
          className={`group h-[70px] w-[70px] rounded-full ${baseButtonClasses} ${locked ? '' : isCompleted ? 'bg-gradient-to-b from-[#a8ffb7] to-[#34ce55] ring-4 ring-white shadow-md hover:shadow-lg' : 'bg-gradient-to-b from-[#34d058] to-[#0ea54b] ring-1 ring-black/10 shadow-lg hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1'}`}
        >
          {isCompleted ? (
            <CompletedIcon />
          ) : (
            <Icon
              className={cn(
                "h-10 w-10",
                locked
                  ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                  : "fill-primary-foreground text-primary-foreground"
              )}
            />
          )}
        <span className="pointer-events-none absolute inset-0 rounded-full before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity" />
            {/* reflexo de vidro */}
            <span className="absolute inset-0 pointer-events-none">
              <span
                className="absolute -inset-1 bg-white/25 blur-md"
                style={{ clipPath: 'polygon(0 0,100% 0,100% 25%,0 40%)', transform: 'rotate(45deg)', animation: 'glass-reflect 4s linear infinite alternate' }}
              />
            </span>
</Button>
      )}
    </div>
  );
  
  // Render para lições bloqueadas
  if (locked) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div role="button" tabIndex={0} className="focus:outline-none">
            {content}
          </div>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="center" sideOffset={12} className="p-0 border-none bg-transparent w-auto" style={{ transform: `translateX(-${rightPosition}px)` }}>
          <div className="relative flex flex-col items-center">
            {/* arrow lingueta */}
            <div className="w-0 h-0 border-x-8 border-x-transparent border-b-[10px] border-slate-800 absolute -top-2 left-1/2 -translate-x-1/2" />
            <div className="bg-slate-800/90 rounded-xl p-4 w-72 flex flex-col gap-y-4 text-slate-400 ring-1 ring-slate-600">
              <h3 className="font-bold text-lg text-slate-300">{title}</h3>
              <p className="text-sm leading-snug">Complete todos os níveis acima pra desbloquear esse aqui!</p>
              <div className="bg-slate-700/60 rounded-full py-3 text-center font-bold tracking-wide cursor-not-allowed select-none">
                BLOQUEADO
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  
  // Render para lições desbloqueadas ainda não concluídas
  if (!locked && !isCompleted) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div role="button" tabIndex={0} className="focus:outline-none">
            {content}
          </div>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="center" sideOffset={12} className="p-0 border-none bg-transparent w-auto" style={{ transform: `translateX(-${rightPosition}px)` }}>
          <div className="relative flex flex-col items-center">
            {/* arrow lingueta */}
            <div className="w-0 h-0 border-x-8 border-x-transparent border-b-[10px] border-[#58cc02] absolute -top-2 left-1/2 -translate-x-1/2" />
            <div className="relative overflow-hidden bg-[#58cc02] rounded-2xl p-4 w-72 flex flex-col gap-y-4 text-white shadow-xl">
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm">Lição {lessonNumber} de {totalLessons}</p>
              <Button
                size="lg"
                className="relative overflow-hidden w-full bg-white text-[#58cc02] font-extrabold uppercase tracking-wide rounded-xl py-3 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:bg-white/90 transition"
                onClick={onPractice}
              >
                COMEÇAR +10 XP
              <span className="pointer-events-none absolute inset-0 rounded-full before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity" />
            {/* reflexo de vidro */}
            <span className="absolute inset-0 pointer-events-none">
              <span
                className="absolute -inset-1 bg-white/25 blur-md"
                style={{ clipPath: 'polygon(0 0,100% 0,100% 25%,0 40%)', transform: 'rotate(45deg)', animation: 'glass-reflect 4s linear infinite alternate' }}
              />
            </span>
</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return isCompleted ? (
    <Popover>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="focus:outline-none"
        >
          {content}
        </div>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" sideOffset={12} className="p-0 border-none bg-transparent w-auto" style={{ transform: `translateX(-${rightPosition}px)` }}>
          <div className="relative flex flex-col items-center">
                    {/* arrow lingueta */}
            <div className="w-0 h-0 border-x-8 border-x-transparent border-b-[12px] border-[#58cc02] absolute -top-2 left-1/2 -translate-x-1/2" />
            <div className="relative overflow-hidden bg-[#58cc02] rounded-2xl p-4 w-72 flex flex-col gap-y-4 text-white shadow-xl">
          {/* reflexo diagonal de vidro animado */}
            <div className="hidden">
              <div
                className="absolute -inset-2 bg-white/25 blur-md"
                style={{
                  clipPath: 'polygon(0 0,100% 0,100% 25%,0 40%)',
                  transform: 'rotate(45deg)',
                  animation: 'glass-reflect 6s linear infinite alternate',
                }}
              />
            </div>
          
            <div className="hidden">
              <div
                className="absolute -inset-2 bg-white/25 blur-md"
                style={{
                  clipPath: 'polygon(0 0,100% 0,100% 25%,0 40%)',
                  transform: 'rotate(45deg)',
                  animation: 'glass-reflect 6s linear infinite alternate',
                }}
              />
            </div>
            <h3 className="font-extrabold text-lg">{title}</h3>
          <p className="text-sm leading-snug opacity-90">{t("prove_titans")}</p>
            {/* divisor */}
            <div className="h-px bg-white/30" />
          <Button
                onClick={onPractice}
                className="w-full bg-white text-[#58cc02] font-extrabold uppercase tracking-wide rounded-xl py-4 ring-2 ring-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:bg-white/90 active:translate-y-0.5 transition-transform relative overflow-hidden"
              >
            {t("practice_5xp")}
          <span className="pointer-events-none absolute inset-0 rounded-full before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity" />
            {/* reflexo de vidro */}
            <span className="absolute inset-0 pointer-events-none">
              <span
                className="absolute -inset-1 bg-white/25 blur-md"
                style={{ clipPath: 'polygon(0 0,100% 0,100% 25%,0 40%)', transform: 'rotate(45deg)', animation: 'glass-reflect 4s linear infinite alternate' }}
              />
            </span>
</Button>
          <Button
                onClick={onTitans}
                className="w-full font-extrabold uppercase tracking-wide rounded-xl py-4 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:brightness-110 active:translate-y-0.5 transition-transform relative overflow-hidden"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg,#ffd133 0px,#ffd133 20px,#ffbe00 20px,#ffbe00 40px)',
                }}
              >
            {t("titans_40xp")}
          <span className="pointer-events-none absolute inset-0 rounded-full before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity" />
            {/* reflexo de vidro */}
            <span className="absolute inset-0 pointer-events-none">
              <span
                className="absolute -inset-1 bg-white/25 blur-md"
                style={{ clipPath: 'polygon(0 0,100% 0,100% 25%,0 40%)', transform: 'rotate(45deg)', animation: 'glass-reflect 4s linear infinite alternate' }}
              />
            </span>
</Button>
        </div>
                </div>
        </PopoverContent>
    </Popover>
  ) : (
    <Link
      href={href}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }}
    >
      {content}
    </Link>
  );
};