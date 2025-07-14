import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore
const db = drizzle(sql, { schema });

type Lesson = { title: string };
interface Unit {
  title: string;
  description: string;
  lessons: Lesson[];
}
interface Course {
  title: string;
  imageSrc: string;
  units: Unit[];
  learnersCount: number;
}

const data: Course[] = [
  {
    title: "Spanish",
    imageSrc: "/es.svg",
    learnersCount: 24000000,
    units: [
      {
        title: "Unit 1",
        description: "Learn the basics of Spanish",
        lessons: [
          { title: "Nouns" },
          { title: "Verbs" },
          { title: "Adjectives" },
        ],
      },
    ],
  },
  {
    title: "Italian",
    imageSrc: "/it.svg",
    learnersCount: 6220000,
    units: [
      {
        title: "Unit 1",
        description: "Learn the basics of Italian",
        lessons: [
          { title: "Nomi" },
          { title: "Verbi" },
          { title: "Aggettivi" },
        ],
      },
    ],
  },
  {
    title: "French",
    imageSrc: "/fr.svg",
    learnersCount: 3170000,
    units: [
      {
        title: "Unit 1",
        description: "Learn the basics of French",
        lessons: [
          { title: "Noms" },
          { title: "Verbes" },
          { title: "Adjectifs" },
        ],
      },
    ],
  },
  {
    title: "Croatian",
    imageSrc: "/hr.svg",
    learnersCount: 2380000,
    units: [
      {
        title: "Unit 1",
        description: "Learn the basics of Croatian",
        lessons: [
          { title: "Imenice" },
          { title: "Glagoli" },
          { title: "Pridjevi" },
        ],
      },
    ],
  },
  {
    title: "German",
    imageSrc: "/alemao.png",
    learnersCount: 1380000,
    units: [
      {
        title: "Unit 1",
        description: "Basics of German",
        lessons: [
          { title: "Nouns" },
          { title: "Verbs" },
          { title: "Adjectives" },
          { title: "Pronouns" },
          { title: "Numbers" },
        ],
      },
      {
        title: "Unit 2",
        description: "Everyday Phrases",
        lessons: [
          { title: "Greetings" },
          { title: "Questions" },
          { title: "Directions" },
          { title: "Food" },
          { title: "Shopping" },
        ],
      },
      {
        title: "Unit 3",
        description: "Travel & Culture",
        lessons: [
          { title: "Transport" },
          { title: "Accommodation" },
          { title: "Sightseeing" },
          { title: "Events" },
          { title: "Customs" },
        ],
      },
      {
        title: "Unit 4",
        description: "Work & Study",
        lessons: [
          { title: "Office" },
          { title: "Emails" },
          { title: "Meetings" },
          { title: "University" },
          { title: "Exams" },
        ],
      },
      {
        title: "Unit 5",
        description: "Advanced Topics",
        lessons: [
          { title: "Idioms" },
          { title: "Slang" },
          { title: "Debate" },
          { title: "Literature" },
          { title: "News" },
        ],
      },
    ],
  },
];

async function main() {
  console.log("Resetting tables...");
  await Promise.all([
    db.delete(schema.challengeOptions),
    db.delete(schema.challenges),
    db.delete(schema.lessons),
    db.delete(schema.units),
    db.delete(schema.userProgress),
    db.delete(schema.courses),
    db.delete(schema.userCourseProgress),
    db.delete(schema.challengeProgress),
  ]);

  console.log("Inserting data...");

  for (const course of data) {
    const [createdCourse] = await db
      .insert(schema.courses)
      .values({ title: course.title, imageSrc: course.imageSrc })
      .returning();

    for (const [unitIndex, unit] of course.units.entries()) {
      const [createdUnit] = await db
        .insert(schema.units)
        .values({
          courseId: createdCourse.id,
          title: unit.title,
          description: unit.description,
          order: unitIndex + 1,
        })
        .returning();

      for (const [lessonIndex, lesson] of unit.lessons.entries()) {
        const [createdLesson] = await db.insert(schema.lessons).values({
          unitId: createdUnit.id,
          title: lesson.title,
          order: lessonIndex + 1,
        }).returning();

        // Se for o primeiro curso German, adicionar desafio "Hallo!"
        if (course.title === "German" && unitIndex === 0 && lessonIndex === 0) {
          const [createdChallenge] = await db.insert(schema.challenges).values({
            lessonId: createdLesson.id,
            type: "SELECT",
            question: "Hallo!",
            order: 1,
          }).returning();

          await db.insert(schema.challengeOptions).values([
            { challengeId: createdChallenge.id, text: "Oi", correct: true, audioSrc: "/hallo.mp3" },
            { challengeId: createdChallenge.id, text: "Olá", correct: false },
            { challengeId: createdChallenge.id, text: "Tchau", correct: false },
            { challengeId: createdChallenge.id, text: "Obrigado", correct: false },
          ]);

          await db.insert(schema.challengeProgress).values({
            userId: "1",
            challengeId: createdChallenge.id,
            completed: true,
          });

          await db.insert(schema.userCourseProgress).values({
            userId: "1",
            courseId: createdCourse.id,
            points: 0,
          });
        }
      }
    }
  }

  console.log("Seeding completed ✅");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
