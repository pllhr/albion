"use server";

import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { streaks, streakLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getStreak = async () => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const userStreak = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  if (!userStreak) {
    // Create initial streak record
    const newStreak = await db.insert(streaks).values({
      userId,
      currentStreak: 0,
      bestStreak: 0,
    }).returning();

    return newStreak[0];
  }

  return userStreak;
};

export const incrementStreak = async () => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const userStreak = await getStreak();
  const now = new Date();
  const lastUpdate = userStreak.lastUpdated;

  const isConsecutiveDay =
    lastUpdate.toDateString() ===
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toDateString();

  if (!isConsecutiveDay && lastUpdate.toDateString() !== now.toDateString()) {
    await db
      .update(streaks)
      .set({ currentStreak: 1, lastUpdated: now })
      .where(eq(streaks.userId, userId));
  } else if (lastUpdate.toDateString() !== now.toDateString()) {
    const newStreak = userStreak.currentStreak + 1;
    await db
      .update(streaks)
      .set({
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, userStreak.bestStreak),
        lastUpdated: now,
      })
      .where(eq(streaks.userId, userId));
  }

  // log diário
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  await db
    .insert(streakLogs)
    .values({ userId, date: today })
    // @ts-ignore drizzle onConflict helper
    .onConflictDoNothing();

  return getStreak();
};

export const freezeStreak = async () => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(streaks)
    .set({ frozen: true })
    .where(eq(streaks.userId, userId));

  return getStreak();
};

export const getStreakLogs = async (year: number, month: number) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  // Busca todos os logs do usuário e filtra pelo mês/ano
  const allLogs = await db.query.streakLogs.findMany({
    where: eq(streakLogs.userId, userId),
  });

  const days = allLogs
    .map((l) => new Date(l.date))
    .filter((d) => d.getFullYear() === year && d.getMonth() === month)
    .map((d) => d.getDate());

  return days;
};

export const unfreezeStreak = async () => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(streaks)
    .set({ frozen: false })
    .where(eq(streaks.userId, userId));

  return getStreak();
};
