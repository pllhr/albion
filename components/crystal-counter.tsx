"use client";

import Link from "next/link";
import Image from "next/image";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";

interface CrystalCounterProps {
  crystals: number;
}

export const CrystalCounter = ({ crystals }: CrystalCounterProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" className="text-sky-500">
          <Image
            src="/diamonds.png"
            height={24}
            width={24}
            alt="Cristais"
            className="mr-2"
          />
          {crystals}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        side="bottom"
        align="center"
        sideOffset={8}
        className="rounded-xl shadow-xl bg-white p-4 w-56 border text-center"
      >
        <Image src="/diamonds.png" alt="Cristais" width={40} height={40} className="mx-auto mb-2" />
        <p className="text-neutral-700 text-sm mb-4">
          Ganhe cristais completando lições e missões. Gaste-os para corações e power-ups!
        </p>
        <Link href="/shop">
          <Button variant="primary" size="sm" className="w-full">
            Ir para a loja
          </Button>
        </Link>
        <Popover.Arrow className="fill-white" />
      </Popover.Content>
    </Popover.Root>
  );
};
