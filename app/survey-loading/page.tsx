"use client";

import Image from "next/image";
import { useEffect } from "react";

const FACTS = [
  "Mais norte-americanos aprendem um idioma no Albion do que no sistema público de ensino dos EUA.",
  "Estudar 15 min por dia pode dobrar seu vocabulário em 3 meses!",
  "Aprender idiomas melhora a memória e a criatividade.",
];

export default function SurveyLoadingPage() {
  const fact = FACTS[Math.floor(Math.random() * FACTS.length)];

  useEffect(() => {
    fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 13 }),
    }).finally(() => {
      setTimeout(() => (window.location.href = "/learn"), 2000);
    });
  }, []);

  return (
    <div className="h-screen w-screen bg-[#0e1a20] text-white flex flex-col items-center justify-center gap-6">
      <Image src="/duo7.png" alt="Mascote dançando" width={160} height={160} />
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-[#6b7a83] font-semibold tracking-widest">AGUARDE...</span>
        <p className="max-w-sm text-sm text-[#c9d4db] leading-snug">{fact}</p>
      </div>
    </div>
  );
}
