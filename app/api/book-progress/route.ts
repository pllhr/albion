import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { bookProgress } from "@/db/schema";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json();
  const { bookId, percentage } = body as { bookId: string; percentage: number };
  if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });

  const pct = Math.round(percentage ?? 0);

  await db.insert(bookProgress)
    .values({ userId, bookId, percentage: pct })
    .onConflictDoUpdate({
      target: [bookProgress.userId, bookProgress.bookId],
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

  const res = await db.query.bookProgress.findFirst({
    where: (bp) => bp.bookId === bookId && bp.userId === userId,
  });
  return NextResponse.json(res ?? {});
} 