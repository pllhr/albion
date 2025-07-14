"use client";

import Link from "next/link";
import { CrystalCounter } from "./crystal-counter";
import Image from "next/image";
import { InfinityIcon } from "lucide-react";

import { courses as coursesTable } from "@/db/schema";
import { CourseSwitcher } from "./course-switcher";
import { Button } from "@/components/ui/button";
import { StreakCounter } from "./streak-popover";


type Props = {

  activeCourse: typeof coursesTable.$inferSelect;
  courses?: typeof coursesTable.$inferSelect[];
  hearts: number;
  crystals?: number;
  points: number;
  hasActiveSubscription: boolean;
};

export const UserProgress = ({ 
  activeCourse,
  courses,
  points,
  hearts,
  crystals = 0,
  hasActiveSubscription
}: Props) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <CourseSwitcher activeCourse={activeCourse} />
      <StreakCounter showCard={false} />
      <CrystalCounter crystals={crystals} />
      <Link href="/shop">
        <Button variant="ghost" className="text-orange-500">
          <Image src="/points.svg" height={28} width={28} alt="Points" className="mr-2" />
          {points}
        </Button>
      </Link>
      <Link href="/shop">
        <Button variant="ghost" className="text-rose-500">
          <Image src="/heart.svg" height={22} width={22} alt="Hearts" className="mr-2" />
          {hasActiveSubscription 
            ? <InfinityIcon className="h-4 w-4 stroke-[3]" /> 
            : hearts
          }
        </Button>
      </Link>
    </div>
  );
};
