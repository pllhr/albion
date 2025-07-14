import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, date } from "drizzle-orm/pg-core";

export const uiLanguageEnum = pgEnum("ui_language", ["de", "en", "pt"]);

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
  learnersCount: integer("learners_count").notNull().default(0),
});

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, { onDelete: "cascade" }),
  hearts: integer("hearts").notNull().default(5),
  uiLanguage: uiLanguageEnum("ui_language"),
  points: integer("points").notNull().default(0),
  crystals: integer("crystals").notNull().default(0),
  onboardingStep: integer("onboarding_step").notNull().default(0),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress),
  units: many(units),
  userLikes: many(userLikes),
  userSaves: many(userSaves),
}));

export const userProgressRelations = relations(userProgress, ({ one, many }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
  likes: many(userLikes),
  saves: many(userSaves),
}));

export const userLikes = pgTable("user_likes", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: [t.userId, t.courseId],
}));

export const userLikesRelations = relations(userLikes, ({ one }) => ({
  user: one(userProgress, {
    fields: [userLikes.userId],
    references: [userProgress.userId],
  }),
  course: one(courses, {
    fields: [userLikes.courseId],
    references: [courses.id],
  }),
}));

export const userSaves = pgTable("user_saves", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: [t.userId, t.courseId],
}));

export const userSavesRelations = relations(userSaves, ({ one }) => ({
  user: one(userProgress, {
    fields: [userSaves.userId],
    references: [userProgress.userId],
  }),
  course: one(courses, {
    fields: [userSaves.courseId],
    references: [courses.id],
  }),
}));

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // Unit 1
  description: text("description").notNull(), // Learn the basics of spanish
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  order: integer("order").notNull(),
  isDivider: boolean("is_divider").notNull().default(false),
});

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "cascade" }).notNull(),
  order: integer("order").notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}));

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  questionAudioSrc: text("question_audio_src"),
  order: integer("order").notNull(),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeOptionsRelations = relations(challengeOptions, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeOptions.challengeId],
    references: [challenges.id],
  }),
}));

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(challengeProgress, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeProgress.challengeId],
    references: [challenges.id],
  }),
}));

export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
});

export const streakLogs = pgTable("streak_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
});

export const streakLogsRelations = relations(streakLogs, ({ one }) => ({
  user: one(userProgress, {
    fields: [streakLogs.userId],
    references: [userProgress.userId],
  }),
}));

export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  currentStreak: integer("current_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  frozen: boolean("frozen").notNull().default(false),
});

// --- Reading feature ---
// --- Reading feature ---
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
  lang: text("lang").notNull(),
  difficulty: text("difficulty").notNull(),
  order: integer("order").notNull(),
  xp: integer("xp").notNull().default(10),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const storiesRelations = relations(stories, ({ many }) => ({
  userLikes: many(userStoryLikes),
  userSaves: many(userStorySaves),
  readingProgress: many(readingProgress),
}));

export const readingProgress = pgTable("reading_progress", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  completed: boolean("completed").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // composite primary key handled via drizzle unique
});

export const knownWord = pgTable("known_word", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  lang: text("lang").notNull(),
  word: text("word").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // composite pk
});

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(userProgress, {
    fields: [streaks.userId],
    references: [userProgress.userId],
  }),
}));

// --- UserCourseProgress ---
export const userCourseProgress = pgTable("user_course_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  points: integer("points").notNull().default(0),
});

export const userCourseProgressRelations = relations(userCourseProgress, ({ one }) => ({
  user: one(userProgress, {
    fields: [userCourseProgress.userId],
    references: [userProgress.userId],
  }),
  course: one(courses, {
    fields: [userCourseProgress.courseId],
    references: [courses.id],
  }),
}));

// --- Todo Categories ---
export const todoCategories = pgTable("todo_categories", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  createdBy: text("created_by").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const todoCategoriesRelations = relations(todoCategories, ({ one, many }) => ({
  course: one(courses, { fields: [todoCategories.courseId], references: [courses.id] }),
  creator: one(userProgress, { fields: [todoCategories.createdBy], references: [userProgress.userId] }),
  todos: many(todos),
}));

// --- Todos ---
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  categoryId: integer("category_id").references(() => todoCategories.id, { onDelete: "set null" }),
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  contentRichText: text("content_rich_text"),
  isDone: boolean("is_done").notNull().default(false),
  status: text("status").notNull().default("backlog"),
  priority: text("priority").notNull().default("normal"),
  isPrivate: boolean("is_private").notNull().default(true),
  position: integer("position").notNull().default(0),
  dueAt: timestamp("due_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const todosRelations = relations(todos, ({ one }) => ({
  course: one(courses, { fields: [todos.courseId], references: [courses.id] }),
  category: one(todoCategories, { fields: [todos.categoryId], references: [todoCategories.id] }),
  user: one(userProgress, { fields: [todos.userId], references: [userProgress.userId] }),
}));

// --- Book Progress ---
export const bookProgress = pgTable("book_progress", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  bookId: text("book_id").notNull(), // pode ser slug ou id numérico
  percentage: integer("percentage").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  pk: [t.userId, t.bookId],
}));

export const bookProgressRelations = relations(bookProgress, ({ one }) => ({
  user: one(userProgress, {
    fields: [bookProgress.userId],
    references: [userProgress.userId],
  }),
}));

// --- Book Chapter Progress ---
export const bookChapterProgress = pgTable("book_chapter_progress", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  bookId: text("book_id").notNull(),
  chapterIndex: integer("chapter_index").notNull(),
  percentage: integer("percentage").notNull().default(0),
  quizScore: integer("quiz_score"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  pk: [t.userId, t.bookId, t.chapterIndex],
}));

export const bookChapterProgressRelations = relations(bookChapterProgress, ({ one }) => ({
  user: one(userProgress, {
    fields: [bookChapterProgress.userId],
    references: [userProgress.userId],
  }),
}));

// --- Annotations ---
export const annotationTypeEnum = pgEnum("annotation_type", ["highlight", "note"]);

export const annotations = pgTable("annotations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  bookId: integer("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  chapterIndex: integer("chapter_index").notNull(),
  startOffset: integer("start_offset").notNull(),
  endOffset: integer("end_offset").notNull(),
  type: annotationTypeEnum("type").notNull(),
  color: text("color").notNull(),
  content: text("content"), // para notas manuscritas/texto livre
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const annotationsRelations = relations(annotations, ({ one }) => ({
  user: one(userProgress, { fields: [annotations.userId], references: [userProgress.userId] }),
  book: one(books, { fields: [annotations.bookId], references: [books.id] }),
}));

// --- Book Chapter Words ---
export const bookChapterWords = pgTable("book_chapter_words", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  bookId: text("book_id").notNull(),
  chapterIndex: integer("chapter_index").notNull(),
  word: text("word").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: [t.userId, t.bookId, t.chapterIndex, t.word],
}));

export const bookChapterWordsRelations = relations(bookChapterWords, ({ one }) => ({
  user: one(userProgress, {
    fields: [bookChapterWords.userId],
    references: [userProgress.userId],
  }),
}));

// --- Books ---
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  imageSrc: text("image_src").notNull(),
  pdfSrc: text("pdf_src"),
});

// --- Book Chapters ---
export const bookChapters = pgTable("book_chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  index: integer("index").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

export const bookChaptersRelations = relations(bookChapters, ({ one }) => ({
  book: one(books, { fields: [bookChapters.bookId], references: [books.id] }),
}));

export const booksRelations = relations(books, ({ many }) => ({
  chapters: many(bookChapters),
  userLikes: many(userBookLikes),
  userSaves: many(userBookSaves),
}));

// --- Book Likes ---
export const userBookLikes = pgTable("user_book_likes", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  bookId: integer("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: [t.userId, t.bookId],
}));

export const userBookLikesRelations = relations(userBookLikes, ({ one }) => ({
  user: one(userProgress, { fields: [userBookLikes.userId], references: [userProgress.userId] }),
  book: one(books, { fields: [userBookLikes.bookId], references: [books.id] }),
}));

// --- Book Saves ---
export const userBookSaves = pgTable("user_book_saves", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  bookId: integer("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: [t.userId, t.bookId],
}));

export const userBookSavesRelations = relations(userBookSaves, ({ one }) => ({
  user: one(userProgress, { fields: [userBookSaves.userId], references: [userProgress.userId] }),
  book: one(books, { fields: [userBookSaves.bookId], references: [books.id] }),
}));

// --- Story Likes ---
export const userStoryLikes = pgTable("user_story_likes", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: [t.userId, t.storyId],
}));

export const userStoryLikesRelations = relations(userStoryLikes, ({ one }) => ({
  user: one(userProgress, { fields: [userStoryLikes.userId], references: [userProgress.userId] }),
  story: one(stories, { fields: [userStoryLikes.storyId], references: [stories.id] }),
}));

// --- Story Saves ---
export const userStorySaves = pgTable("user_story_saves", {
  userId: text("user_id").references(() => userProgress.userId, { onDelete: "cascade" }).notNull(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: [t.userId, t.storyId],
}));

export const userStorySavesRelations = relations(userStorySaves, ({ one }) => ({
  user: one(userProgress, { fields: [userStorySaves.userId], references: [userProgress.userId] }),
  story: one(stories, { fields: [userStorySaves.storyId], references: [stories.id] }),
}));
