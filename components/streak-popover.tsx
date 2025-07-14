"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/calendar";
import Image from "next/image";
import * as Popover from "@radix-ui/react-popover";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getStreak } from "@/actions/streak";

interface Props {
  showCard?: boolean; // mantém compatibilidade
}

export const StreakCounter = ({ showCard = false }: Props) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [streak, setStreak] = useState({
    currentStreak: 0,
    bestStreak: 0,
    frozen: false,
  });

  useEffect(() => {
    const load = async () => {
      const data = await getStreak();
      setStreak(data);
    };
    load();
  }, []);

  if (showCard) {
    return (
      <div className="bg-[#0f1c24] rounded-xl p-4 w-full text-[#8ca0ad]">
        <p className="text-xl font-extrabold mb-1 text-white">{streak.currentStreak} dias de ofensiva</p>
        <p className="text-sm mb-4">Faça uma lição hoje pra começar uma nova ofensiva!</p>
        {/* faixa semanal */}
        <div className="bg-[#13212b] rounded-md p-3 mb-4 relative">
          <div className="flex justify-between mb-2">
            {[..."DSTQQSS"].map((d) => (
              <span key={d} className="text-xs text-[#8ca0ad] font-bold">
                {d}
              </span>
            ))}
          </div>
          {/* barra de progresso */}
          <div className="h-3 bg-[#1f3946] rounded-full relative overflow-hidden">
            <div
              className="h-full bg-orange-400 transition-all"
              style={{ width: `${(streak.currentStreak / 7) * 100}%` }}
            />
            {/* ícone chama */}
            <Image
              src="/flame.png"
              alt="Chama"
              width={20}
              height={20}
              className="absolute -top-2 right-0"
              style={{ left: `calc(${(streak.currentStreak / 7) * 100}% - 10px)` }}
            />
          </div>
        </div>
        {/* sociedade card */}
        <div className="border border-[#28404f] rounded-lg p-3 w-full mb-4 flex gap-3 items-start">
          <Image src="/cadeado.png" height={24} width={24} alt="Cadeado" />
          <p className="text-xs text-left">
            <span className="font-bold text-white block mb-1">Sociedade da Chama Acesa</span>
            Consiga uma ofensiva de 7 dias pra entrar na Sociedade da Chama Acesa e ganhar recompensas exclusivas.
          </p>
        </div>
        <button className="w-full bg-[#2bc3ff] hover:bg-[#35d0ff] text-[#00334b] rounded-lg py-2 font-bold uppercase tracking-wide transition">
          Ver mais
        </button>
      </div>
    );
  }

  return (
    <Dialog>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="flex items-center text-orange-400 hover:opacity-80 transition">
            <Image
              src="/ofensiva3png.png"
              height={24}
              width={24}
              alt="Ofensiva"
              className="mr-1"
            />
            <span className="font-bold">{streak.currentStreak}</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="center"
            sideOffset={8}
            className="rounded-xl shadow-xl bg-[#0f1c24] p-4 w-80 text-center z-[9999] text-[#8ca0ad]"
          >
            <Popover.Arrow className="fill-[#0f1c24]" />
            {/* Conteúdo pequeno */}
            <Image src="/clock.png" height={48} width={48} alt="Relógio" />
            <p className="text-lg font-bold mt-2">{streak.currentStreak} dias de ofensiva</p>
            <p className="text-sm mb-3">Faça uma lição hoje pra começar uma nova ofensiva!</p>
            {/* dias */}
            <div className="flex flex-col items-center w-full mb-4 bg-[#13212b] rounded-md py-3">
              <div className="flex justify-between w-full max-w-[220px] mb-1">
                {[..."DSTQQSS"].map((d) => (
                  <span key={d} className="text-xs">
                    {d}
                  </span>
                ))}
              </div>
              <div className="flex justify-between w-full max-w-[220px]">
                {[...Array(7)].map((_, i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-full ${i < streak.currentStreak ? "bg-orange-400" : "bg-gray-700"}`}
                  />
                ))}
              </div>
            </div>
            {/* card sociedade */}
            <div className="border border-[#28404f] rounded-lg p-3 w-full mb-4 flex gap-3 items-start">
              <Image src="/cadeado.png" height={24} width={24} alt="Cadeado" />
              <p className="text-xs text-left">
                <span className="font-bold text-white block mb-1">Sociedade da Chama Acesa</span>
                Consiga uma ofensiva de 7 dias pra entrar na Sociedade da Chama Acesa e ganhar recompensas exclusivas.
              </p>
            </div>
            <DialogTrigger asChild>
              <button className="w-full bg-[#2bc3ff] hover:bg-[#35d0ff] text-[#00334b] rounded-lg py-2 font-bold uppercase tracking-wide transition">
                Ver mais
              </button>
            </DialogTrigger>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Dialog grande */}
      <DialogContent className="max-w-sm bg-[#0f1c24] border-none text-[#8ca0ad] p-0 overflow-auto max-h-[90vh]">
        <div className="p-4">
          <p className="text-2xl font-extrabold mb-4">{streak.currentStreak} dias de ofensiva</p>
          {/* alerta */}
          <div className="flex items-start gap-3 bg-[#0d1d26] p-3 rounded-md mb-6">
            <Image src="/clock.png" height={32} width={32} alt="Relógio" />
            <div className="space-y-1 text-left">
              <p className="font-semibold text-white">Faça uma lição hoje pra começar uma nova ofensiva!</p>
              <p className="text-sm text-sky-500 font-bold">COMECE UMA OFENSIVA</p>
            </div>
          </div>
          {/* Calendário funcional */}
          <div className="bg-[#13212b] p-4 rounded-md mb-6">
            <div className="flex items-center justify-between mb-2 text-white text-sm font-bold select-none">
              <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1))}>&lt;</button>
              <p>
                {displayDate.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                }).toUpperCase()}
              </p>
              <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1))}>&gt;</button>
            </div>
            <Calendar
              year={displayDate.getFullYear()}
              month={displayDate.getMonth()}
              today={new Date()}
              onDayClick={(d) => alert(`Você estudou em ${d.toLocaleDateString()}`)}
            />
          </div>
          {/* sociedade */}
          <p className="text-lg font-bold text-white mb-2">Sociedade da Chama Acesa</p>
          <div className="border border-[#28404f] rounded-lg p-3 flex gap-3 items-start">
            <Image src="/cadeado.png" height={24} width={24} alt="Cadeado" />
            <p className="text-xs">Consiga uma ofensiva de 7 dias pra entrar na Sociedade da Chama Acesa e ganhar recompensas exclusivas.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakCounter;
