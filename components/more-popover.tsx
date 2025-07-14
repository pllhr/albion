"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  iconSize?: number;
};

export const MorePopover = ({ iconSize = 45 }: Props) => {
  const router = useRouter();

  const goTo = (path: string) => {
    router.push(path);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="sidebar" className="justify-start h-[52px] w-full">
          <Image src="/other.png" alt="MAIS" height={iconSize} width={iconSize} className="mr-5" />
          MAIS
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" className="p-0 w-[200px]">
        <div className="flex flex-col divide-y">
          <Button variant="ghost" className="justify-start py-3" onClick={() => goTo("/settings")}>Configurações</Button>
          <Button variant="ghost" className="justify-start py-3" onClick={() => goTo("/help")}>Ajuda</Button>
          <Button variant="danger" className="justify-start py-3" onClick={() => goTo("/logout")}>Sair</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
