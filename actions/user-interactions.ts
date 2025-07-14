"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs";

import db from "@/db/drizzle";
import { 
  userBookLikes, 
  userBookSaves, 
  userStoryLikes, 
  userStorySaves 
} from "@/db/schema";

export const toggleLikeBook = async (bookId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingLike = await db.query.userBookLikes.findFirst({
    where: and(eq(userBookLikes.userId, userId), eq(userBookLikes.bookId, bookId)),
  });

  if (existingLike) {
    await db.delete(userBookLikes).where(and(eq(userBookLikes.userId, userId), eq(userBookLikes.bookId, bookId)));
  } else {
    await db.insert(userBookLikes).values({ userId, bookId });
  }

  revalidatePath("/library");
  revalidatePath(`/library/[category]`); // Idealmente, invalidar a categoria específica
};

export const toggleSaveBook = async (bookId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingSave = await db.query.userBookSaves.findFirst({
    where: and(eq(userBookSaves.userId, userId), eq(userBookSaves.bookId, bookId)),
  });

  if (existingSave) {
    await db.delete(userBookSaves).where(and(eq(userBookSaves.userId, userId), eq(userBookSaves.bookId, bookId)));
  } else {
    await db.insert(userBookSaves).values({ userId, bookId });
  }

  revalidatePath("/library");
  revalidatePath(`/library/[category]`);
};

export const toggleLikeStory = async (storyId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingLike = await db.query.userStoryLikes.findFirst({
    where: and(eq(userStoryLikes.userId, userId), eq(userStoryLikes.storyId, storyId)),
  });

  if (existingLike) {
    await db.delete(userStoryLikes).where(and(eq(userStoryLikes.userId, userId), eq(userStoryLikes.storyId, storyId)));
  } else {
    await db.insert(userStoryLikes).values({ userId, storyId });
  }

  revalidatePath("/reading");
};

export const toggleSaveStory = async (storyId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingSave = await db.query.userStorySaves.findFirst({
    where: and(eq(userStorySaves.userId, userId), eq(userStorySaves.storyId, storyId)),
  });

  if (existingSave) {
    await db.delete(userStorySaves).where(and(eq(userStorySaves.userId, userId), eq(userStorySaves.storyId, storyId)));
  } else {
    await db.insert(userStorySaves).values({ userId, storyId });
  }

  revalidatePath("/reading");
};
