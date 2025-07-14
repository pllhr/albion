import { cache } from "react";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs";

import db from "@/db/drizzle";
import { 
  challengeProgress,
  courses, 
  lessons, 
  units, 
  userProgress,
  userSubscription,
  userCourseProgress,
  userLikes,
  userSaves,
  books,
  bookChapters,
  stories,
  userBookLikes,
  userBookSaves,
  userStoryLikes,
  userStorySaves
} from "@/db/schema";

export const getUserProgress = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Busca o progresso básico do usuário (sem joins complexos)
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (!progress) {
    return null;
  }

  // Busca opcionalmente o curso ativo caso exista
  let activeCourseData: {
    id: number;
    title: string;
    imageSrc: string;
    learnersCount: number;
  } | null = null;

  if (progress.activeCourseId) {
    activeCourseData = await db.query.courses.findFirst({
      where: eq(courses.id, progress.activeCourseId),
      columns: {
        id: true,
        title: true,
        imageSrc: true,
        learnersCount: true,
      },
    }) ?? null;
  }

  return {
    ...progress,
    activeCourse: activeCourseData ?? null,
  };
});

export const getUnits = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return [];
  }

  const data = await db.query.units.findMany({
    columns: {
      id: true,
      title: true,
      description: true,
      courseId: true,
      order: true,
      isDivider: true,
    },
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(
                  challengeProgress.userId,
                  userId,
                ),
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (
        lesson.challenges.length === 0
      ) {
        return { ...lesson, completed: false };
      }

      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return challenge.challengeProgress
          && challenge.challengeProgress.length > 0
          && challenge.challengeProgress.every((progress) => progress.completed);
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
});

export const getCourses = cache(async () => {
  try {
    const data = await db
      .select({
        id: courses.id,
        title: courses.title,
        imageSrc: courses.imageSrc,
        learnersCount: courses.learnersCount,
      })
      .from(courses);

    return data;
  } catch (error) {
    console.error("getCourses query error", error);
    return [];
  }
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return null;
  }

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return !challenge.challengeProgress 
          || challenge.challengeProgress.length === 0 
          || challenge.challengeProgress.some((progress) => progress.completed === false)
      });
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const courseProgress = await getCourseProgress();

  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) {
    return null;
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) {
    return null;
  }

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed = challenge.challengeProgress 
      && challenge.challengeProgress.length > 0
      && challenge.challengeProgress.every((progress) => progress.completed)

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges }
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) {
    return 0;
  }

  const completedChallenges = lesson.challenges
    .filter((challenge) => challenge.completed);
  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100,
  );

  return percentage;
});

const DAY_IN_MS = 86_400_000;
export const getUserSubscription = cache(async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, userId),
  });

  if (!data) return null;

  const isActive = 
    data.stripePriceId &&
    data.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return {
    ...data,
    isActive: !!isActive,
  };
});

// Retorna todos os cursos já iniciados pelo usuário com o XP respectivo
export const getUserCoursesProgress = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const data = await db
    .select({
      id: courses.id,
      title: courses.title,
      imageSrc: courses.imageSrc,
      xp: userCourseProgress.points,
    })
    .from(userCourseProgress)
    .innerJoin(courses, eq(courses.id, userCourseProgress.courseId))
    .where(eq(userCourseProgress.userId, userId));

  return data;
});

export const getTopTenUsers = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });

  return data;
});

export const getUserLikes = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const data = await db.query.userLikes.findMany({
    where: eq(userLikes.userId, userId),
    columns: {
      courseId: true,
    },
  });

  return data.map((like) => like.courseId);
});

export const getUserSaves = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const data = await db.query.userSaves.findMany({
    where: eq(userSaves.userId, userId),
    columns: {
      courseId: true,
    },
  });

  return data.map((save) => save.courseId);
});

export const getBooks = cache(async (category: string) => {
  const data = await db.query.books.findMany({
    where: eq(books.category, category),
    orderBy: (books, { asc }) => [asc(books.id)],
  });

  return data;
});

export const getStories = cache(async () => {
  const data = await db.query.stories.findMany({
    orderBy: (stories, { asc }) => [asc(stories.order)],
  });

  return data;
});

export const getUserBookLikes = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const data = await db.query.userBookLikes.findMany({
    where: eq(userBookLikes.userId, userId),
    columns: {
      bookId: true,
    },
  });

  return data.map((like) => like.bookId);
});

export const getUserBookSaves = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const data = await db.query.userBookSaves.findMany({
    where: eq(userBookSaves.userId, userId),
    columns: {
      bookId: true,
    },
  });

  return data.map((save) => save.bookId);
});

export const getUserStoryLikes = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const data = await db.query.userStoryLikes.findMany({
    where: eq(userStoryLikes.userId, userId),
    columns: {
      storyId: true,
    },
  });

  return data.map((like) => like.storyId);
});

// ------------------- BOOKS -------------------
export const getBookWithChapters = cache(async (bookId: number) => {
  const data = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    with: {
      chapters: {
        orderBy: (bookChapters, { asc }) => [asc(bookChapters.index)],
        columns: {
          id: true,
          index: true,
          title: true,
        },
      },
    },
  });
  return data;
});

export const getBookChapter = cache(async (bookId: number, index: number) => {
  const chapter = await db.query.bookChapters.findFirst({
    where: (bookChapters, { and, eq }) => and(eq(bookChapters.bookId, bookId), eq(bookChapters.index, index)),
  });
  return chapter;
});

export const getUserStorySaves = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const data = await db.query.userStorySaves.findMany({
    where: eq(userStorySaves.userId, userId),
    columns: {
      storyId: true,
    },
  });

  return data.map((save) => save.storyId);
});
