"use client";

import Image from "next/image";
import { useState } from "react";
import TypewriterText from "../../components/TypewriterText";

export default function SurveyMotivation2() {
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 12 }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => (window.location.href = "/survey-loading"), 600);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0e1a20] text-white flex flex-col items-center justify-center gap-8">
      <div className="relative inline-flex items-center animate-[float_12s_ease-in-out_infinite]" style={{ animationDuration: '600ms' }}>
        <span className="px-4 py-2 rounded-lg border border-[#4b5c66] text-white font-medium max-w-xs text-center">
          <TypewriterText text="...por isso o Albion é feito para ser divertido como um jogo!" />
        </span>
        <span className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0e1a20] border-b border-r border-[#4b5c66]" />
      </div>
      <Image src="/duo6.png" alt="Mascote" width={140} height={140} />

      <button
        onClick={handleContinue}
        disabled={loading}
        className="mt-10 relative overflow-hidden rounded-full px-10 py-3 text-sm font-bold tracking-wide transition-colors duration-200 shadow-lg shadow-black/40 transform-gpu hover:scale-105 bg-[#8de641] text-black hover:bg-[#7cd337] disabled:bg-[#2f3e44] disabled:text-[#6b7a83]"
      >
        {loading ? '...' : 'CONTINUAR'}
      </button>
    </div>
  );
}
