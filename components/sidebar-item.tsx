"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  iconSrc: string;
  href: string;
  iconSize?: number;
  onClick?: () => void;
};

export const SidebarItem = ({
  label,
  iconSrc,
  href,
  iconSize = 32,
  onClick,
}: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    onClick ? (
      <Button
        variant={active ? "sidebarOutline" : "sidebar"}
        className="justify-start h-[52px]"
        onClick={onClick}
      >
        <Image
          src={iconSrc}
          alt={label}
          className="mr-5"
          height={iconSize}
          width={iconSize}
        />
        {label}
      </Button>
    ) : (
    <Button
      variant={active ? "sidebarOutline"  : "sidebar"}
      className="justify-start h-[52px]"
      asChild
    >
      <Link href={href}>
        <Image
          src={iconSrc}
          alt={label}
          className="mr-5"
          height={iconSize}
          width={iconSize}
        />
        {label}
      </Link>
    </Button>
    )
  );
};
