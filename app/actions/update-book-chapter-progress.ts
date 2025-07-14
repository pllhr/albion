"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { bookChapterProgress } from "@/db/schema";

export async function updateBookChapterProgress(bookId: string, chapterIndex: number, percentage: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const pct = Math.round(percentage);

  await db.insert(bookChapterProgress)
    .values({ userId, bookId, chapterIndex, percentage: pct })
    .onConflictDoUpdate({
      target: [bookChapterProgress.userId, bookChapterProgress.bookId, bookChapterProgress.chapterIndex],
      set: { percentage: pct, updatedAt: new Date() },
    });

  return { success: true };
} 