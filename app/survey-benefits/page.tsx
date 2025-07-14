"use client";

import Image from "next/image";
import TypewriterText from "../../components/TypewriterText";
import { useState } from "react";

const CARDS = [
  {
    id: 1,
    icon: "/messages.png",
    title: "Falar com confiança",
    subtitle: "Exercícios de fala e escuta sem complicação",
  },
  {
    id: 2,
    icon: "/palavras.png",
    title: "Adquirir vocabulário",
    subtitle: "Palavras e expressões comuns",
  },
  {
    id: 3,
    icon: "/relogio.png",
    title: "Criar o hábito de aprender",
    subtitle: "Lembretes inteligentes, desafios divertidos e muito mais",
  },
];

export default function SurveyBenefitsPage() {
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 7 }),
      });
    } catch (e) {
      console.error("onboarding step error", e);
    } finally {
      setTimeout(() => (window.location.href = "/survey-goal"), 800);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0e1a20] text-white flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center px-4 pt-4 gap-2">
        <div className="flex-1 flex justify-center items-center gap-1">
          {/* Back */}
          <button
            onClick={() => window.history.back()}
            aria-label="Voltar"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#8fa1ab] hover:text-lime-400 hover:bg-[#1a2a30] transition-colors duration-200 focus:outline-none"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Progress */}
          <div className="h-5 bg-[#24353d] rounded-full w-full max-w-xl overflow-hidden">
            <div className="h-5 bg-red-500 rounded-full w-4/5" />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-6 pt-8 flex flex-col items-center gap-8">
        {/* Balão + Avatar */}
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-0">
          {/* Speech bubble */}
          <div className="relative inline-flex items-center animate-[float_12s_ease-in-out_infinite]" style={{ animationDuration: '600ms' }}>
            <span className="px-4 py-2 rounded-lg border border-[#4b5c66] bg-transparent text-white font-medium">
              <TypewriterText text="Veja o que você vai conseguir fazer!" />
            </span>
            <span className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0e1a20] border-b border-r border-[#4b5c66]" />
          </div>
          {/* Avatar */}
          <div className="relative" style={{ transformOrigin: 'center' }}>
            <Image src="/duo5.png" alt="Mascote" width={96} height={96} />
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-16 h-3 bg-[#1a2a30] rounded-full opacity-60" />
          </div>
        </div>

        {/* Cards */}
        <div className="w-full max-w-lg flex flex-col gap-6">
          {CARDS.map((c) => (
            <div key={c.id} className="group flex items-start gap-4 px-4 py-3 border-b border-[#2e3c44]">
              <Image src={c.icon} alt="icon" width={56} height={56} className="transition-transform duration-300 group-hover:translate-y-1" />
              <div className="flex flex-col">
                <span className="font-semibold text-white mb-1">{c.title}</span>
                <span className="text-sm text-[#8fa1ab] leading-tight">{c.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="h-20 w-full border-t border-[#24353d] flex items-center justify-end px-8">
        <button
          onClick={handleContinue}
          disabled={loading}
          className={`relative overflow-hidden rounded-full px-10 py-3 text-sm font-bold tracking-wide transition-colors duration-200 shadow-lg shadow-black/40 transform-gpu hover:scale-105 after:absolute after:top-0 after:left-0 after:w-1/3 after:h-full after:rotate-12 after:bg-white/20 after:blur-sm after:opacity-60 after:-translate-x-full after:animate-[sheen_2.4s_linear_infinite] ${
            loading ? 'bg-[#2f3e44] text-[#6b7a83]' : 'bg-[#8de641] text-black hover:bg-[#7cd337]'
          }`}
        >
          {loading ? (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 bg-[#246d1a] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          ) : (
            'CONTINUAR'
          )}
        </button>
      </div>
    </div>
  );
}
