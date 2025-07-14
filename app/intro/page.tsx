"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const IntroPage = () => {
  const router = useRouter();

  const handleContinue = async () => {
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 1 }),
      });
    } catch (e) {
      console.error("onboarding step error", e);
    } finally {
      window.location.href = "/ready";
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0e1a20] flex items-center justify-center text-white relative">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Image
            src="/aprendemascote.gif"
            alt="Mascote Albion animado"
            width={350}
            height={350}
            priority
          />
          {/* Balão de fala */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap">
            {/* speech bubble */}
            <div className="relative inline-flex items-center animate-bounce" style={{ animationDuration: '2s' }}>
              <span className="px-4 py-2 rounded-lg border border-[#4b5c66] bg-transparent text-white font-medium">Olá, Eu sou o Albion!</span>
              {/* arrow */}
              <span className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0e1a20] border-b border-r border-[#4b5c66]"></span>
            </div>
          </div>
        </div>
        <button
          onClick={handleContinue}
          className="fixed bottom-8 right-8 bg-[#8de641] hover:bg-[#7cd337] text-black font-bold text-sm tracking-wide px-10 py-3 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2"
        >
          CONTINUAR
        </button>
      {/* bottom divider */}
      <div className="absolute bottom-28 left-0 w-full h-px bg-[#4b5c66]" />
    </div>
    </div>
  );
};

export default IntroPage;
