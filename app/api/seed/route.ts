import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { courses, units, lessons } from "@/db/schema";
import { eq } from "drizzle-orm";

const COURSE_DATA = [
  { title: "Inglês", imageSrc: "/eua.png" },
  { title: "Espanhol", imageSrc: "/espanha.png" },
  { title: "Turco", imageSrc: "/turkey.png" },
  { title: "Holandês", imageSrc: "/holanda.png" },
  { title: "Russo", imageSrc: "/russia.png" },
  { title: "Chinês", imageSrc: "/china.png" },
  { title: "Coreano", imageSrc: "/coreia.png" },
  { title: "Japonês", imageSrc: "/japao.png" },
  { title: "Alemão", imageSrc: "/alemao.png" },
  { title: "Francês", imageSrc: "/france.png" },
  { title: "Italiano", imageSrc: "/italia.png" },
];

export const GET = async () => {
  // evita rodar se já existe algum curso
  const existingCourses = await db.select({ id: courses.id }).from(courses).limit(1);
  if (existingCourses.length > 0) {
    return NextResponse.json({ message: "Seed já executado" });
  }

  for (const { title, imageSrc } of COURSE_DATA) {
    const [createdCourse] = await db.insert(courses).values({ title, imageSrc }).returning();

    // unidade e lição mínimas
    const [createdUnit] = await db
      .insert(units)
      .values({
        title: "Unidade 1",
        description: `Introdução a ${title}`,
        courseId: createdCourse.id,
        order: 1,
      })
      .returning();

    await db.insert(lessons).values({
      title: "Lição 1",
      unitId: createdUnit.id,
      order: 1,
    });
  }

  return NextResponse.json({ message: "Seed concluído" });
};
