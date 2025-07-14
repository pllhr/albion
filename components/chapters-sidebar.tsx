"use client";
import { useState } from "react";

import Link from "next/link";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { ChevronDown, CheckCircle2, Circle, Dot } from "lucide-react";

interface Chapter {
  id: number;
  index: number;
  title: string;
}

interface Props {
  bookId: number;
  chapters: Chapter[];
  currentIndex: number;
  completed: Set<number>;
}

export default function ChaptersSidebar({ bookId, chapters, currentIndex, completed }: Props) {
  // Agrupar capítulos em sessões de 5
  const sessions: { name: string; chapters: Chapter[] }[] = [];
  chapters.forEach(ch => {
    const sessIdx = Math.floor(ch.index / 5);
    if (!sessions[sessIdx]) sessions[sessIdx] = { name: `Sessão ${sessIdx + 1}`, chapters: [] } as any;
    sessions[sessIdx].chapters.push(ch);
  });

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
      {sessions.map((sess, sidx) => (
        <Popover key={sidx} open={openIdx===sidx} onOpenChange={(o)=>setOpenIdx(o? sidx : null)}>
          <PopoverTrigger asChild>
            <button className={`w-full flex items-center justify-between font-semibold text-lg transition-colors ${openIdx===sidx?'text-blue-700':'hover:underline'}`}>
              <span>{sess.name}</span>
              {/* progresso */}
              {(() => {const done = sess.chapters.filter(c=>completed.has(c.index)).length; return <span className="text-sm text-gray-500 ml-2">{done}/{sess.chapters.length}</span>; })()}
              <ChevronDown className={`h-4 w-4 transition-transform ${openIdx===sidx?'rotate-180':'rotate-0'} text-gray-500`} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="p-0 w-64 rounded-lg shadow-xl bg-white max-h-64 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-3 space-y-1"
            >
            {/* barra de progresso */}
            {(() => {const done = sess.chapters.filter(c=>completed.has(c.index)).length; const pct = Math.round(done*100/ sess.chapters.length); return (
              <div className="mb-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{width: pct+ '%'}} />
                </div>
              </div>);})()}
            {sess.chapters.map(ch => (
              <Link key={ch.id} href={`/reading/book/${bookId}/${ch.index}`}
                className={`flex items-center gap-2 px-2 py-1 rounded-md hover:bg-blue-100 ${ch.index === currentIndex ? 'bg-blue-200 font-semibold' : ''}`}
              >
                {completed.has(ch.index) ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : ch.index === currentIndex ? (
                  <Dot className="h-4 w-4 text-blue-600 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 shrink-0" />
                )}
                <span className={`${completed.has(ch.index) ? 'line-through text-green-600' : ''}`}>{ch.index + 1}. {ch.title}</span>
              </Link>
            ))}
                      </motion.div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
