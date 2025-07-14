"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs";

import db from "@/db/drizzle";

import { getCourseById, getUserProgress, getUserSubscription } from "@/db/queries";
import { challengeProgress, challenges, userProgress, userCourseProgress, userLikes, userSaves } from "@/db/schema";
import { incrementStreak } from "./streak";

export type CompleteChallengeProps = {
  challengeId: number;
  userAnswer: any; // Defina um tipo mais específico se souber o que é esperado
};

export const upsertUserProgress = async (courseId: number) => {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const course = await getCourseById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.units.length || !course.units[0].lessons.length) {
    throw new Error("Course is empty");
  }

  const existingUserProgress = await getUserProgress();

  if (existingUserProgress) {
    // atualiza curso ativo
await db.update(userProgress).set({
      activeCourseId: courseId,
      userName: user.firstName || "User",
      userImageSrc: user.imageUrl || "/mascot.svg",
    });

    // garante existência de linha na tabela de progresso por curso
const existingCourseProgress = await db.query.userCourseProgress.findFirst({
  where: and(eq(userCourseProgress.userId, userId), eq(userCourseProgress.courseId, courseId)),
  columns: { id: true },
});
if (!existingCourseProgress) {
  await db.insert(userCourseProgress).values({ userId, courseId, points: 0 });
}

revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  await db.insert(userProgress).values({
    userId,
    activeCourseId: courseId,
    userName: user.firstName || "User",
    userImageSrc: user.imageUrl || "/mascot.svg",
  });

  // garante existência de linha na tabela de progresso por curso
const existingCourseProgress = await db.query.userCourseProgress.findFirst({
  where: and(eq(userCourseProgress.userId, userId), eq(userCourseProgress.courseId, courseId)),
  columns: { id: true },
});
if (!existingCourseProgress) {
  await db.insert(userCourseProgress).values({ userId, courseId, points: 0 });
}

revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) {
    return { error: "practice" }; 
  }

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (userSubscription?.isActive) {
    return { error: "subscription" };
  }

  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" };
  }

  await db.update(userProgress).set({
    hearts: Math.max(currentUserProgress.hearts - 1, 0),
  }).where(eq(userProgress.userId, userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const addCrystals = async (amount: number = 5) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const current = await getUserProgress();
  if (!current) throw new Error("User progress not found");

  await db.update(userProgress).set({
    crystals: current.crystals + amount,
  }).where(eq(userProgress.userId, userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};

export const spendCrystals = async (amount: number) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const current = await getUserProgress();
  if (!current) throw new Error("User progress not found");

  if (current.crystals < amount) {
    throw new Error("Not enough crystals");
  }

  await db.update(userProgress).set({
    crystals: current.crystals - amount,
  }).where(eq(userProgress.userId, userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};

export const refillHearts = async () => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (currentUserProgress.hearts === 5) {
    throw new Error("Hearts are already full");
  }

  await db.update(userProgress).set({
    hearts: 5,
  }).where(eq(userProgress.userId, currentUserProgress.userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};

export const completeChallenge = async ({ challengeId, userAnswer }: CompleteChallengeProps) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const existingProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  });

  if (existingProgress) {
    throw new Error("Challenge already completed");
  }

  await db.insert(challengeProgress).values({
    userId,
    challengeId,
    completed: true,
  });

  // Increment streak when completing a challenge
  await incrementStreak();

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  return { correct: true };
};

export const toggleLikeCourse = async (courseId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingLike = await db.query.userLikes.findFirst({
    where: and(eq(userLikes.userId, userId), eq(userLikes.courseId, courseId)),
  });

  if (existingLike) {
    await db.delete(userLikes).where(and(eq(userLikes.userId, userId), eq(userLikes.courseId, courseId)));
  } else {
    await db.insert(userLikes).values({ userId, courseId });
  }

  revalidatePath("/courses");
};

export const toggleSaveCourse = async (courseId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingSave = await db.query.userSaves.findFirst({
    where: and(eq(userSaves.userId, userId), eq(userSaves.courseId, courseId)),
  });

  if (existingSave) {
    await db.delete(userSaves).where(and(eq(userSaves.userId, userId), eq(userSaves.courseId, courseId)));
  } else {
    await db.insert(userSaves).values({ userId, courseId });
  }

  revalidatePath("/courses");
};
