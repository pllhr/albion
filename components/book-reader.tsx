"use client";

import { StoryReader } from "@/components/story-reader";
import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { throttle } from "lodash";
import { Check } from "lucide-react";

interface Props {
  lang: "en" | "pt" | "de";
  text: string;
  chapters?: string[];
  bookId?: string;
  initialProgress?: number;
}

export default function BookReader({ lang, text, chapters, bookId, initialProgress = 0 }: Props) {
  const sections = chapters && chapters.length > 0 ? chapters : [text];
  const sectionRefs = useRef<(HTMLDivElement|null)[]>([]);

  const [progress, setProgress] = useState<number>(() => {
    if (typeof window === "undefined" || !bookId) return initialProgress;
    const saved = localStorage.getItem(`bookProgress:${bookId}`);
    return saved ? Number(saved) : initialProgress;
  });

  useEffect(() => {
    const handler = throttle(() => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const value = total > 0 ? (window.scrollY / total) * 100 : 0;
      setProgress(value);
      if (bookId) localStorage.setItem(`bookProgress:${bookId}`, String(value));
    }, 200);

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [bookId]);

  useEffect(() => {
    if (!bookId) return;
    const timer = setTimeout(() => {
      fetch("/api/book-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, percentage: progress }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [progress, bookId]);

  useEffect(() => {
    if (progress > 0) {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      window.scrollTo({ top: (progress / 100) * total, behavior: "smooth" });
    }
  }, []);

  // observe chapter visibility to mark completion
  const [chapterProgress, setChapterProgress] = useState<number[]>(() => sections.map(()=>0));

  useEffect(()=>{
    if (sections.length<=1) return;
    const observers: IntersectionObserver[] = [];
    sections.forEach((_, idx)=>{
      const el = sectionRefs.current[idx];
      if (!el) return;
      const obs = new IntersectionObserver(([entry])=>{
        if (entry.isIntersecting) {
          // mark seen 100% for simplicity when intersecting top
          setChapterProgress(prev=>{
            const newArr=[...prev];
            newArr[idx]=100;
            return newArr;
          });
          if (bookId) {
            fetch("/api/book-chapter-progress",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookId,chapterIndex:idx,percentage:100})});
          }
        }
      },{root:null,threshold:0.4});
      obs.observe(el);
      observers.push(obs);
    });
    return ()=>{observers.forEach(o=>o.disconnect());};
  },[sections,bookId]);

  return (
    <div className="relative">
      <div className="sticky top-0 z-40">
        <Progress value={progress} className="h-2 rounded-none" />
      </div>
      {/* sidebar chapters */}
      {sections.length>1 && (
        <div className="fixed left-0 top-14 bottom-0 w-40 overflow-y-auto bg-white/70 backdrop-blur-md border-r hidden md:block">
          <ul className="p-4 space-y-2 text-sm">
            {sections.map((_,idx)=>(
              <li key={idx} className="flex items-center gap-2">
                <button onClick={()=>{
                  const el=sectionRefs.current[idx];
                  if(el) el.scrollIntoView({behavior:"smooth"});
                }} className="underline text-blue-600">
                  Capítulo {idx+1}
                </button>
                {chapterProgress[idx]>=100 && <Check size={14} className="text-green-600"/>}
              </li>))}
          </ul>
        </div>
      )}
      {sections.length===1 && (
        <StoryReader lang={lang} text={text} bookId={bookId} chapterIndex={0} />
      )}
      {sections.length>1 && (
        <div className="md:ml-44 space-y-8">
          {sections.map((sec,idx)=>(
            <div key={idx} ref={el=>sectionRefs.current[idx]=el} id={`chapter-${idx}`} className="scroll-mt-20">
              <h2 className="text-xl font-bold mb-3">Capítulo {idx+1}</h2>
              <StoryReader lang={lang} text={sec} bookId={bookId} chapterIndex={idx} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 