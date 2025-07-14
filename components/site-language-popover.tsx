"use client";

import { useState, useRef, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import fetcher from "@/lib/fetcher";

interface Course {
  id: number;
  title: string;
  imageSrc: string;
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "/eua.png" },
  { code: "es", label: "Español", flag: "/espanha.png" },
  { code: "fr", label: "Français", flag: "/france.png" },
  { code: "it", label: "Italiano", flag: "/italia.png" },
  { code: "de", label: "Deutsch", flag: "/alemao.png" },
  { code: "ko", label: "한국어", flag: "/coreia.png" },
  { code: "ja", label: "日本語", flag: "/japao.png" },
  { code: "ru", label: "Русский", flag: "/russia.png" },
  { code: "zh", label: "中文", flag: "/china.png" },
  { code: "br", label: "Português do Brasil", flag: "/brasil.png" },
  { code: "hr", label: "Hrvatski", flag: "/croata.png" },
  { code: "nl", label: "Nederland", flag: "/holanda.png" },
  { code: "tr", label: "Türkçe", flag: "/turkey.png" },
  { code: "irl", label: "Gaeilge", flag: "/irlandes.png" },
];

export const SiteLanguagePopover = () => {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetcher<Course[]>('/api/courses');
        setCourses(response);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const openPopover = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const closePopover = () => {
    // pequeno delay para permitir mover o cursor de trigger -> conteúdo sem flicker
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const toggleClick = () => setOpen((prev) => !prev);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        asChild
        onMouseEnter={openPopover}
        onMouseLeave={closePopover}
      >
        <button className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 hover:text-gray-500">
          Idioma do site: Português
          <ChevronDown className="w-4 h-4" />
        </button>
      </Popover.Trigger>
      <Popover.Content
        onMouseEnter={openPopover}
        onMouseLeave={closePopover}
        side="bottom"
        align="end"
        sideOffset={8}
        className="rounded-xl shadow-xl bg-white border p-4 w-64 grid gap-2 max-h-[400px] overflow-y-auto z-50"
      >
        {LANGUAGES.map((lng) => (
          <button
            key={lng.code}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-2 py-1 text-sm text-neutral-700 w-full text-left"
          >
            <Image src={lng.flag} alt={lng.label} width={32} height={24} className="rounded-sm" />
            <span>{lng.label}</span>
          </button>
        ))}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-500"></div>
          </div>
        )}
        {courses.map((course) => (
          <button
            key={course.id}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-2 py-1 text-sm text-neutral-700 w-full text-left"
          >
            <Image src={course.imageSrc} alt={course.title} width={32} height={24} className="rounded-sm" />
            <span>{course.title}</span>
          </button>
        ))}
        <Popover.Arrow className="fill-white" />
      </Popover.Content>
    </Popover.Root>
  );
};

