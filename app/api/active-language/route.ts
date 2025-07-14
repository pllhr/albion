import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import db from "../../../db/drizzle";
import { userProgress, courses } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
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
}
