"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { bookChapterWords } from "@/db/schema";

export async function addBookChapterWord(bookId: string, chapterIndex: number, word: string) {
  const { userId } = await auth();
  if (!userId) return;

  await db.insert(bookChapterWords)
    .values({ userId, bookId, chapterIndex, word })
    .onConflictDoNothing();
} 