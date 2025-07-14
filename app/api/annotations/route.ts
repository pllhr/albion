import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { annotations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const bookId = Number(url.searchParams.get("bookId"));
  const chapterIndex = Number(url.searchParams.get("chapterIndex"));
  if (Number.isNaN(bookId) || Number.isNaN(chapterIndex)) {
    return new NextResponse("Invalid params", { status: 400 });
  }
  const rows = await db
    .select()
    .from(annotations)
    .where(
      and(
        eq(annotations.userId, userId),
        eq(annotations.bookId, bookId),
        eq(annotations.chapterIndex, chapterIndex)
      )
    );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const {
    bookId,
    chapterIndex,
    startOffset,
    endOffset,
    type,
    color,
    content,
    id,
    delete: del,
  } = body;
  if (!bookId || chapterIndex === undefined) return new NextResponse("Invalid", { status: 400 });

  if (del && id) {
    await db.delete(annotations).where(and(eq(annotations.id, id), eq(annotations.userId, userId)));
    return new NextResponse(null, { status: 204 });
  }

  if (id) {
    await db
      .update(annotations)
      .set({ startOffset, endOffset, type, color, content })
      .where(and(eq(annotations.id, id), eq(annotations.userId, userId)));
    return new NextResponse(null, { status: 204 });
  }

  const result = await db
    .insert(annotations)
    .values({ userId, bookId, chapterIndex, startOffset, endOffset, type, color, content })
    .returning();
  return NextResponse.json(result[0]);
}
