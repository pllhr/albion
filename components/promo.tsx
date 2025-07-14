import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export const Promo = () => {
  return (
    <div className="border-2 rounded-xl p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image
            src="/unlimited.svg"
            alt="Pro"
            height={26}
            width={26}
          />
          <h3 className="font-bold text-lg">
            Aprimore para
          </h3>
          <Image
            src="/super.png"
            alt="Super"
            height={70}
            width={70}
          />
        </div>
        <p className="text-muted-foreground">
          Obtenha corações ilimitados e mais!
        </p>
      </div>
      <Button
        asChild
        variant="super"
        className="w-full"
        size="lg"
      >
        <Link href="/shop">
          Aprimore hoje
        </Link>
      </Button>
    </div>
  );
};
