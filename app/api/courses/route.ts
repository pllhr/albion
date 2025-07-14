import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { courses } from "@/db/schema";

export const GET = async () => {
  const data = await db.query.courses.findMany();
  return NextResponse.json(data);
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const data = await db.insert(courses).values({
    ...body,
  }).returning();

  return NextResponse.json(data[0]);
};

// Novo endpoint para obter curso ativo
export const GET_ACTIVE = async () => {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const result = await db
    .select({ language: courses.title })
    .from(userProgress)
    .leftJoin(courses, eq(courses.id, userProgress.activeCourseId))
    .where(eq(userProgress.userId, userId))
    .limit(1);

  const language = result[0]?.language ?? "seu novo idioma";
  return NextResponse.json({ language });
};
