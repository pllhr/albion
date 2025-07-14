import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { bookChapterProgress } from "@/db/schema";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { bookId, chapterIndex, percentage } = await req.json();
  if (bookId === undefined || chapterIndex === undefined) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const pct = Math.round(percentage ?? 0);

  await db.insert(bookChapterProgress)
    .values({ userId, bookId, chapterIndex, percentage: pct })
    .onConflictDoUpdate({
      target: [bookChapterProgress.userId, bookChapterProgress.bookId, bookChapterProgress.chapterIndex],
      set: { percentage: pct, updatedAt: new Date() },
    });

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({});

  const url = new URL(req.url!);
  const bookId = url.searchParams.get("bookId");
  if (!bookId) return NextResponse.json({});

  const data = await db.select().from(bookChapterProgress).where((bp) => bp.userId.eq(userId).and(bp.bookId.eq(bookId)));
  return NextResponse.json(data);
} 