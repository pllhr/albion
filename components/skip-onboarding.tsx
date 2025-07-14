"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONBOARDING_PREFIXES = [
  "/intro",
  "/survey",
  "/survey-start",
  "/survey-purpose",
  "/survey-motivation-1",
  "/survey-motivation-2",
  "/survey-language",
  "/survey-benefits",
  "/survey-goal",
  "/survey-loading",
  "/survey-level",
];

export const SkipOnboarding = () => {
  const pathname = usePathname();

  // Se a página atual não for parte do onboarding, não renderiza nada
  if (!ONBOARDING_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <Link
      href="/courses"
      aria-label="Pular onboarding e ir para a escolha do curso"
      className="fixed top-4 right-4 z-[60] text-[#8fa1ab] hover:text-white text-3xl font-bold"
    >
      &times;
    </Link>
  );
};
