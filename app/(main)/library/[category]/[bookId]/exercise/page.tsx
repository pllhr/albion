"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Question { word: string; answer: string; options: string[]; }
function shuffle<T>(arr:T[]){return arr.sort(()=>Math.random()-0.5);}

export default function DynamicExercisePage() {
  const params = useSearchParams();
  const router = useRouter();
  const bookId = params.get("bookId");
  const chapterIndex = params.get("chapterIndex");

  const [questions,setQuestions]=useState<Question[]|null>(null);
  const [step,setStep]=useState(0);
  const [score,setScore]=useState(0);
  const [pending,startTransition]=useTransition();

  useEffect(()=>{
    if(!bookId||!chapterIndex) return;
    startTransition(async ()=>{
      const res=await fetch(`/api/book-exercise?bookId=${bookId}&chapterIndex=${chapterIndex}`);
      const data=await res.json();
      setQuestions(data as Question[]);
    });
  },[bookId,chapterIndex]);

  if(!bookId||!chapterIndex) return <p>Parâmetros ausentes.</p>;
  if(!questions) return <div className="flex justify-center py-10"><Loader2 className="animate-spin"/></div>;

  if(step>=questions.length){
    // send score
    useEffect(()=>{
      fetch("/api/book-chapter-progress",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookId,chapterIndex:Number(chapterIndex),quizScore:Math.round((score/questions.length)*100)})});
    },[]);
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Pontuação: {score}/{questions.length}</h1>
        <button onClick={()=>router.back()} className="underline text-blue-600">Voltar</button>
      </div>
    );
  }

  const q=questions[step];
  const answer=(opt:string)=>{
    if(opt===q.answer) setScore(s=>s+1);
    setStep(s=>s+1);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">Traduza: <span className="text-blue-600">{q.word}</span></h1>
      <div className="flex flex-col gap-3">
        {shuffle(q.options).map(opt=>(
          <button key={opt} onClick={()=>answer(opt)} className="border rounded-lg px-4 py-2 hover:bg-gray-100 text-left">
            {opt}
          </button>
        ))}
      </div>
      <p className="text-sm text-neutral-600">Pergunta {step+1}/{questions.length}</p>
    </div>
  );
} 