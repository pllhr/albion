import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { bookChapterWords } from "@/db/schema";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { bookId, chapterIndex, word } = await req.json();
  if (!bookId || chapterIndex === undefined || !word) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  await db.insert(bookChapterWords)
    .values({ userId, bookId, chapterIndex, word })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
} 