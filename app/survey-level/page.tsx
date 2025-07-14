"use client";

import Image from "next/image";
import { useState } from "react";
import TypewriterText from "../../components/TypewriterText";

const OPTIONS = [
  { id: 1, label: "Não sei nada do idioma" },
  { id: 2, label: "Conheço algumas palavras comuns" },
  { id: 3, label: "Consigo ter conversas simples" },
  { id: 4, label: "Consigo falar de assuntos variados" },
  { id: 5, label: "Consigo falar sobre a maioria dos assuntos em detalhes" },
];

export default function SurveyLevelPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const MESSAGES: Record<number, string> = {
    1: "Certo, vamos começar do zero!",
    2: "Certo. Vamos aumentar o seu conhecimento!",
    3: "Certo. Vamos aumentar o seu conhecimento!",
    4: "Olha só, que legal!",
    5: "Fantástico, seu aprendizado já está ótimo!",
  };

  const prompt = selected ? MESSAGES[selected] : "Qual é o seu nível no idioma?";

  const handleContinue = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 6 }),
      });
    } catch (e) {
      console.error("onboarding step error", e);
    } finally {
      setTimeout(() => (window.location.href = "/survey-benefits"), 800);
    }
  };

  return (
    <div className="h-screen w-screen bg-white text-[#0e1a20] flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center px-4 pt-4 gap-2">
        <div className="flex-1 flex justify-center items-center gap-1">
          {/* Back */}
          <button
            onClick={() => window.history.back()}
            aria-label="Voltar"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#8fa1ab] hover:text-lime-400 hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Progress */}
          <div className="h-5 bg-[#24353d] rounded-full w-full max-w-xl overflow-hidden">
            <div className="h-5 bg-red-500 rounded-full w-3/5" />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-6 pt-8 flex flex-col items-center gap-6">
        {/* Question */}
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-0">
          {/* Speech bubble */}
          <div className="relative inline-flex items-center animate-[float_12s_ease-in-out_infinite]" style={{ animationDuration: '600ms' }}>
            <span className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-white font-medium">
              <TypewriterText text={prompt} />
            </span>
            <span className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0e1a20] border-b border-r border-gray-300" />
          </div>
          {/* Avatar */}
          <div className="relative" style={{ transformOrigin: 'center' }}>
            <Image src="/duo5.png" alt="Mascote" width={96} height={96} />
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-16 h-3 bg-gray-200 rounded-full opacity-60" />
          </div>
        </div>
        {/* Options */}
        <div className="w-full max-w-md flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const active = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`group flex items-center gap-4 rounded-xl px-6 py-3 border transition-colors duration-200 text-left ${
                  active ? "border-lime-500 bg-gray-100" : "border-gray-300 bg-white hover:bg-gray-100"
                }`}
              >
                <Image src={`/net${opt.id}.png`} alt="level icon" width={48} height={48} />
                <span className={active ? "text-lime-400 font-semibold" : "text-white"}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="h-20 w-full border-t border-[#24353d] flex items-center justify-end px-8">
        <button
          disabled={!selected || loading}
          onClick={handleContinue}
          className={`relative overflow-hidden rounded-full px-10 py-3 text-sm font-bold tracking-wide transition-colors duration-200 shadow-lg shadow-black/40 transform-gpu hover:scale-105 after:absolute after:top-0 after:left-0 after:w-1/3 after:h-full after:rotate-12 after:bg-white/20 after:blur-sm after:opacity-60 after:-translate-x-full after:animate-[sheen_2.4s_linear_infinite] ${
            !selected || loading ? "bg-gray-300 text-[#6b7a83]" : "bg-[#8de641] text-black hover:bg-[#7cd337]"
          }`}
        >
          {loading ? (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 bg-[#246d1a] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          ) : (
            "CONTINUAR"
          )}
        </button>
      </div>
    </div>
  );
}
