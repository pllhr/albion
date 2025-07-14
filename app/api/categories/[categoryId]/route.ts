import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { todoCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: { categoryId: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = Number(params.categoryId);
  if (Number.isNaN(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const { name } = body as { name?: string };
  if (!name || name.trim() === "") return NextResponse.json({ message: "Name required" }, { status: 422 });

  const [row] = await db
    .update(todoCategories)
    .set({ name: name.trim() })
    .where(eq(todoCategories.id, id))
    .returning();

  if (!row || row.userId !== userId) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: { categoryId: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = Number(params.categoryId);
  if (Number.isNaN(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  const [row] = await db.delete(todoCategories).where(eq(todoCategories.id, id)).returning();
  if (!row || row.userId !== userId) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
