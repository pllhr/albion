import { Sidebar } from "@/components/sidebar";
import { getUserProgress } from "@/db/queries";
import { Lang } from "@/utils/i18n";
import { MobileHeader } from "@/components/mobile-header";

type Props = {
  children: React.ReactNode;
};

const MainLayout = async ({
  children,
}: Props) => {
  const userProgress = await getUserProgress();
  const lang: Lang = (userProgress?.uiLanguage ?? "en") as Lang;
  return (
    <>
      <MobileHeader />
      <Sidebar className="hidden lg:flex" lang={lang} />
      <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0">
        <div className="max-w-[1056px] mx-auto pt-6 h-full">
          {children}
        </div>
      </main>
    </>
  );
};
 
export default MainLayout;
