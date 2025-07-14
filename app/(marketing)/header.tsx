"use client";

import Image from "next/image";
import { Loader } from "lucide-react";
import { 
  ClerkLoaded, 
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4">
      <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/hero2.png" height={65} width={65} alt="Mascote albion" className="logo-float" />
          {/* Logo text with explode animation */}
            <span className="logo-explode text-3xl lg:text-4xl font-extrabold text-red-600 leading-none select-none brand-fade">
              {"albion".split("").map((l, idx) => (
                <span key={idx} className="letter inline-block">{l}</span>
              ))}
            </span>
        </div>
        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
            />
          </SignedIn>
          <SignedOut>
            <SignInButton
              mode="modal"
              afterSignInUrl="/learn"
              afterSignUpUrl="/learn"
            >
              <Button size="lg" variant="default" className="transition-transform duration-300 ease-in-out hover:scale-105">
                Login
              </Button>
            </SignInButton>
          </SignedOut>
        </ClerkLoaded>
      </div>
    <style jsx global>{`
          @keyframes logoFloat {0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}
          @keyframes brandFade {0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
          .logo-float{animation:logoFloat 4s ease-in-out infinite;}
          .brand-fade{animation:brandFade 1s ease-out forwards;}
          .logo-explode:hover .letter{animation:explode-letter 0.7s forwards cubic-bezier(.25,.46,.45,.94);}
          .logo-explode .letter:nth-child(1){--tx:-40px;--ty:-35px;}
          .logo-explode .letter:nth-child(2){--tx:35px;--ty:-30px;}
          .logo-explode .letter:nth-child(3){--tx:-30px;--ty:40px;}
          .logo-explode .letter:nth-child(4){--tx:45px;--ty:45px;}
          .logo-explode .letter:nth-child(5){--tx:-50px;--ty:-10px;}
          .logo-explode .letter:nth-child(6){--tx:55px;--ty:10px;}
          @keyframes explode-letter{to{transform:translate(var(--tx),var(--ty)) rotate(720deg);opacity:0;}}

        `}</style>
      </header>
  );
};
