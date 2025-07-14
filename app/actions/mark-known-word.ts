"use server";
import { db } from '@/lib/db';
import { knownWord } from '@/db/schema';
import { auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';

export async function markKnownWord(word: string, lang: 'en'|'pt'|'de') {
  const { userId } = auth();
  if (!userId) return { error: 'unauthenticated' };

  const lower = word.toLowerCase();
  try {
    await db.insert(knownWord).values({ userId, lang, word: lower });
  } catch (e) {
    // ignore duplicate primary key errors
  }
  return { ok: true };
}
