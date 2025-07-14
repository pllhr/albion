import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { todoCategories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(_: Request, { params }: { params: { courseId: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const courseId = Number(params.courseId);
  if (Number.isNaN(courseId)) return NextResponse.json({ message: "Invalid course" }, { status: 400 });

  const rows = await db
    .select()
    .from(todoCategories)
    .where(and(eq(todoCategories.courseId, courseId), eq(todoCategories.createdBy, userId)));
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const courseId = Number(params.courseId);
  if (Number.isNaN(courseId)) return NextResponse.json({ message: "Invalid course" }, { status: 400 });

  const body = await req.json();
  const { name } = body as { name?: string };
  if (!name || name.trim() === "") return NextResponse.json({ message: "Name required" }, { status: 422 });

  const [row] = await db
    .insert(todoCategories)
    .values({ name: name.trim(), courseId, createdBy: userId })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
