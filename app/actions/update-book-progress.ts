"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { bookProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateBookProgress(bookId: string, percentage: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const pct = Math.round(percentage);

  await db.insert(bookProgress)
    .values({ userId, bookId, percentage: pct })
    .onConflictDoUpdate({
      target: [bookProgress.userId, bookProgress.bookId],
      set: { percentage: pct, updatedAt: new Date() },
    });

  return { success: true };
} 