import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { todos } from "@/db/schema";
import { eq, and, or, desc, asc } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: { courseId: string } }) {
  const { userId } = await auth();
  const courseId = Number(params.courseId);
  if (!courseId) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }

  const data = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.courseId, courseId),
        or(eq(todos.isPrivate, false), eq(todos.userId, userId ?? ""))
      )
    )
    .orderBy(asc(todos.position));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const courseId = Number(params.courseId);
  if (!courseId) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }

  const body = await req.json();
  const {
    title,
    contentRichText = "",
    isPrivate = true,
    categoryId = null,
    dueAt = null,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // get current max position
  const [{ maxPosition }] = await db
    .select({ maxPosition: desc(todos.position) })
    .from(todos)
    .where(eq(todos.courseId, courseId))
    .limit(1);

  const [inserted] = await db
    .insert(todos)
    .values({
      courseId,
      userId,
      title,
      contentRichText,
      isPrivate,
      categoryId,
      dueAt: dueAt ? new Date(dueAt) : null,
      position: (maxPosition ?? 0) + 1,
    })
    .returning();

  return NextResponse.json(inserted, { status: 201 });
}
