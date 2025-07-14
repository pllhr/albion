"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


import { courses as coursesTable } from "@/db/schema";

import { Button } from "@/components/ui/button";


interface CourseSwitcherProps {
  activeCourse: typeof coursesTable.$inferSelect;
}

export const CourseSwitcher = ({ activeCourse }: CourseSwitcherProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="group p-0">
          <Image
            src={activeCourse.imageSrc}
            alt={activeCourse.title}
            className="rounded-md border transition-transform duration-300 ease-in-out group-hover:rotate-12 group-hover:translate-y-1 group-hover:translate-x-1 group-hover:scale-110 active:scale-95"
            width={32}
            height={32}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" sideOffset={4} className="w-56">
        <DropdownMenuItem disabled className="flex items-center gap-x-2 font-semibold text-primary animate-pulse">
          <Image src={activeCourse.imageSrc} alt={activeCourse.title} width={24} height={24} className="rounded-md border scale-110 animate-pulse transition-transform duration-300 ease-in-out hover:rotate-12 hover:translate-y-1 hover:translate-x-1 hover:scale-125 active:scale-100" />
          <span className="text-sm font-medium truncate">{activeCourse.title}</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/courses" className="flex items-center w-full gap-x-2">
            <div className="h-6 w-6 flex items-center justify-center rounded-md border transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95 text-neutral-500 text-lg">+</div>
            <span className="text-sm font-medium">Adicionar curso</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
