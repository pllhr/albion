"use client";

import { MorePopover } from "@/components/more-popover";

import Link from "next/link";
import Image from "next/image";
import {
  ClerkLoading,
  ClerkLoaded,
  UserButton,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";

import { t, Lang } from "@/utils/i18n";

type Props = {
  className?: string;
  lang?: Lang;
};

export const Sidebar = ({ className, lang = "en" }: Props) => {

  return (
    <div className={cn(
      "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2",
      className,
    )}>
      <div className="flex flex-col flex-1 gap-y-4 pt-4">
        <Link href="/learn" className="flex items-center gap-x-3">
          <Image
            src="/hero2.png" className="logo-float"
            height={60}
            width={60}
            alt="Mascote albion"
          />
          <span className="text-3xl font-extrabold text-red-600 leading-none select-none brand-fade">albion</span>
        </Link>
        <style jsx global>{`
          @keyframes logoFloat {0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}
          @keyframes brandFade {0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
          .logo-float{animation:logoFloat 4s ease-in-out infinite;}
          .brand-fade{animation:brandFade 1s ease-out forwards;}
        `}</style>
        <div className="flex flex-col gap-y-2 flex-1 mt-8">
          <SidebarItem 
            label={t("learn", lang)} 
            href="/learn"
            iconSrc="/beca.png" iconSize={45}
          />
          <SidebarItem 
            label={t("ranking", lang)}  
            href="/leaderboard"
            iconSrc="/trofeu.png" iconSize={45} 
          />
          <SidebarItem 
            label={t("missions", lang)} 
            href="/quests"
            iconSrc="/quest.png" iconSize={45}
          />
          <SidebarItem 
            label={t("reading", lang)} 
            href="/reading"
            iconSrc="/book.png" iconSize={45}
          />
          <SidebarItem 
            label={t("shop", lang)} 
            href="/shop"
            iconSrc="/creditcard.png" iconSize={45}
          />
          <SidebarItem 
            label={t("profile", lang)} 
            href="/profile"
            iconSrc="/perfil.png" iconSize={45}
          />
          <SidebarItem 
            label={t("digitalLibrary", lang)} 
            href="/library"
            iconSrc="/todo-list.png" iconSize={45}
          />
          <MorePopover />
        </div>
        <div className="mt-auto mb-4">
          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: {
                    height: 32,
                    width: 32,
                  }
                }
              }}
            />
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
};
