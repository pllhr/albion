"use client";

import Image from "next/image";
import TypewriterText from "../../components/TypewriterText";
import { useEffect, useState } from "react";

const OPTIONS = [
  { id: 1, label: "YouTube", icon: "/youtube.png" },
  { id: 2, label: "Facebook ou Instagram", icon: "/faceinsta.png" },
  { id: 3, label: "Busca do Google", icon: "/google.png" },
  { id: 4, label: "TikTok", icon: "/tiktok.png" },
  { id: 5, label: "Notícia, artigo ou blog", icon: "/news.png" },
  { id: 6, label: "WhatsApp", icon: "/whatsapp.png" },
  { id: 7, label: "TV", icon: "/tv.png" },
  { id: 8, label: "Amigos ou família", icon: "/amigos.png" },
  { id: 9, label: "Outros", icon: "/other.png" },
];

export default function SurveyPage() {
  const [stage, setStage] = useState<"enter" | "exit">("enter");
  const [avatarSrc, setAvatarSrc] = useState("/duo3.png");
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStage("exit"), 50);
    const swap = setTimeout(() => setAvatarSrc("/duo4.png"), 400);
    return () => {
      clearTimeout(timer);
      clearTimeout(swap);
    };
  }, []);

  const handleContinue = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 3 }),
      });
    } catch (e) {
      console.error("onboarding step error", e);
    } finally {
      setTimeout(() => (window.location.href = "/survey-purpose"), 800);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0e1a20] text-white flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center px-4 pt-4 gap-2">
        <div className="flex-1 flex justify-center items-center gap-1">
          {/* Back arrow */}
          <button
            onClick={() => window.history.back()}
            aria-label="Voltar"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#8fa1ab] hover:text-lime-400 hover:bg-[#1a2a30] transition-colors duration-200 focus:outline-none"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Progress bar */}
          <div className="h-5 bg-[#24353d] rounded-full w-full max-w-xl overflow-hidden">
            <div className="h-5 bg-red-500 rounded-full w-1/5" />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-6 pt-6">
        {/* Avatar + Speech */}
        {stage === "exit" && (
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-0 mt-0">
            {/* Speech bubble */}
            <div className="relative inline-flex items-center animate-[float_12s_ease-in-out_infinite]" style={{ animationDuration: '600ms' }}>
              <span className="px-4 py-2 rounded-lg border border-[#4b5c66] bg-transparent text-white font-medium">
                <TypewriterText text="Como você soube do Aprende.ai?" />
              </span>
              <span className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0e1a20] border-b border-r border-[#4b5c66]" />
            </div>
            {/* Avatar */}
            <div className="relative" style={{ transformOrigin: 'center' }}>
              <Image src={avatarSrc} alt="Mascote" width={96} height={96} />
              <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-16 h-3 bg-[#1a2a30] rounded-full opacity-60" />
            </div>
          </div>
        )}
        {/* Options */}
        {stage === "exit" && (
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {OPTIONS.map((opt) => {
              const active = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`group flex items-center gap-4 rounded-xl px-6 py-4 border transition-colors duration-200 text-left ${
                    active ? "border-lime-500 bg-[#132026]" : "border-[#4b5c66] bg-transparent hover:bg-[#132026]"
                  }`}
                >
                  <Image src={opt.icon} alt="icon" width={48} height={48} className="transform transition-transform duration-200 group-hover:translate-y-1.5 group-hover:rotate-6" />
                  <span className={active ? "text-lime-400 font-semibold" : "text-white"}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-20 w-full border-t border-[#24353d] flex items-center justify-end px-8">
        <button
          disabled={!selected || loading}
          onClick={handleContinue}
          className={`relative overflow-hidden rounded-full px-10 py-3 text-sm font-bold tracking-wide transition-colors duration-200 shadow-lg shadow-black/40 transform-gpu hover:scale-105 after:absolute after:top-0 after:left-0 after:w-1/3 after:h-full after:rotate-12 after:bg-white/20 after:blur-sm after:opacity-60 after:-translate-x-full after:animate-[sheen_2.4s_linear_infinite] ${
            !selected || loading ? "bg-[#2f3e44] text-[#6b7a83]" : "bg-[#8de641] text-black hover:bg-[#7cd337]"
          }`}
        >
          {loading ? (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-[#246d1a] rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : (
            "CONTINUAR"
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation-name: fadeIn;
        }
              /* pointers removed */
        .speech {
          position: relative;
        }
        .speech::before {
          content: "";
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 2px;
          background: #4b5c66;
        }
        .speech::after {
          content: "";
          position: absolute;
          left: -14px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 6px;
          height: 6px;
          background: #0e1a20;
          border-left: 1px solid #4b5c66;
          border-top: 1px solid #4b5c66;
        }
      `}</style>
    </div>
  );
}
