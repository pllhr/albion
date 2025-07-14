"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetcher } from "@/lib/fetcher";

interface Course {
  id: number;
  title: string;
  imageSrc: string;
}

export function LanguageSelector() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleContinue = async () => {
    if (!selectedCourse) return;

    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 4, courseId: selectedCourse }),
      });
      router.push("/survey-purpose");
    } catch (error) {
      console.error("Error saving course selection:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0e1a20] text-white flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center px-4 pt-4 gap-2">
        <div className="flex-1 flex justify-center items-center gap-1">
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#8fa1ab] hover:text-lime-400 hover:bg-[#1a2a30] transition-colors duration-200 focus:outline-none"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="h-5 bg-[#24353d] rounded-full w-full max-w-xl overflow-hidden">
            <div className="h-5 bg-red-500 rounded-full w-1/4" />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-6 pt-10">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 mt-10">
          {/* Speech bubble */}
          <div className="relative inline-flex items-center animate-[float_12s_ease-in-out_infinite]" style={{ animationDuration: "600ms" }}>
            <span className="px-4 py-2 rounded-lg border border-[#4b5c66] bg-transparent text-white font-medium">
              <span className="text-lime-400">Que legal!</span> Agora, me diga qual idioma você quer aprender...
            </span>
            <span className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0e1a20] border-b border-r border-[#4b5c66]" />
          </div>
          {/* Avatar */}
          <div className="relative" style={{ transformOrigin: "center" }}>
            <Image src="/duo5.png" alt="Mascote" width={96} height={96} />
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-16 h-3 bg-[#1a2a30] rounded-full opacity-60" />
          </div>
        </div>
        
        {/* Course options */}
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {courses.map((course) => {
            const active = selectedCourse === course.id;
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`group flex items-center gap-4 rounded-xl px-6 py-4 border transition-colors duration-200 text-left ${
                  active ? "border-lime-500 bg-[#132026]" : "border-[#4b5c66] bg-transparent hover:bg-[#132026]"
                }`}
              >
                <Image 
                  src={course.imageSrc} 
                  alt={course.title} 
                  width={36} 
                  height={36} 
                  className="transform transition-transform duration-200 group-hover:translate-y-1.5 group-hover:rotate-6"
                />
                <span className={active ? "text-lime-400 font-semibold" : "text-white"}>{course.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="h-20 w-full border-t border-[#24353d] flex items-center justify-end px-8">
        <button
          disabled={!selectedCourse || loading}
          onClick={handleContinue}
          className={`relative overflow-hidden rounded-full px-10 py-3 text-sm font-bold tracking-wide transition-colors duration-200 shadow-lg shadow-black/40 transform-gpu hover:scale-105 after:absolute after:top-0 after:left-0 after:w-1/3 after:h-full after:rotate-12 after:bg-white/20 after:blur-sm after:opacity-60 after:-translate-x-full after:animate-[sheen_2.4s_linear_infinite] ${
            !selectedCourse || loading ? "bg-[#2f3e44] text-[#6b7a83]" : "bg-[#8de641] text-black hover:bg-[#7cd337]"
          }`}
        >
          {loading ? (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 bg-[#246d1a] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          ) : (
            "CONTINUAR"
          )}
        </button>
      </div>
    </div>
  );
}
