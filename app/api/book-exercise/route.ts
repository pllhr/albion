import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { bookChapterWords } from "@/db/schema";

function shuffle<T>(arr: T[]) {
  return arr.sort(() => Math.random() - 0.5);
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const url = new URL(req.url!);
  const bookId = url.searchParams.get("bookId");
  const chapterIndex = Number(url.searchParams.get("chapterIndex"));
  if (!bookId || Number.isNaN(chapterIndex)) return NextResponse.json({ error: "Bad params" }, { status: 400 });

  // get up to 20 words
  const rows = await db
    .select({ word: bookChapterWords.word })
    .from(bookChapterWords)
    .where((w) => w.userId.eq(userId).and(w.bookId.eq(bookId)).and(w.chapterIndex.eq(chapterIndex)))
    .limit(30);

  const words = rows.map((r) => r.word);
  const sample = shuffle(words).slice(0, 10);

  const questions = await Promise.all(sample.map(async (w) => {
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(w)}`);
      const json = await res.json();
      const translation = Array.isArray(json) ? json[0][0][0] as string : "";
      const distractors = shuffle(words.filter(x => x !== w)).slice(0,3);
      const options = shuffle([translation, ...distractors]);
      return { word: w, answer: translation, options };
    } catch {
      return null;
    }
  }));

  return NextResponse.json(questions.filter(Boolean));
} 