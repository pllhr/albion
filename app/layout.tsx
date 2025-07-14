import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { CompletedLessonModal } from "@/components/modals/completed-lesson-modal";
import { MoreModal } from "@/components/modals/more-modal";
import { Navigation } from "@/components/navigation";
import "./globals.css";
import { getUserProgress } from "@/db/queries";
import { I18nProvider } from "@/providers/i18n-provider";
import { Lang } from "@/utils/i18n";
import "./glass.css";
import { SkipOnboarding } from "@/components/skip-onboarding";

const font = Quicksand({ subsets: ["latin"], weight: ["400","500","600","700"] });

export const metadata: Metadata = {
  title: "aprende.ai",
  description: "Aprenda idiomas com aprende.ai",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userProgress = await getUserProgress();
  const lang: Lang = (userProgress?.uiLanguage ?? "en") as Lang;

  return (
    <ClerkProvider>
      <html lang="pt-br">
        <body className={font.className}>
            <I18nProvider lang={lang}>
          <Toaster />
          <ExitModal />
          <HeartsModal />
          <PracticeModal />
          <CompletedLessonModal />
          <MoreModal />
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-transparent to-black/10 lg:hidden">
            <Navigation />
          </div>
          <SkipOnboarding />
          <div className="min-h-screen">
            {children}
          </div>
                    </I18nProvider>
          </body>
      </html>
    </ClerkProvider>
  );
}
