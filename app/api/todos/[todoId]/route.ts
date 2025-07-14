import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET = async (_req: Request, { params }: { params: { todoId: string } }) => {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = Number(params.todoId);
  if (Number.isNaN(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const todo = await db.query.todos.findFirst({ where: eq(todos.id, id) });
  if (!todo || (todo.isPrivate && todo.userId !== userId)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(todo);
};

interface PutBody {
  title?: string;
  contentRichText?: string;
  isDone?: boolean;
  position?: number;
  categoryId?: number | null;
  isPrivate?: boolean;
}

export const PUT = async (req: Request, { params }: { params: { todoId: string } }) => {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number(params.todoId);
  if (Number.isNaN(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = (await req.json()) as PutBody;

  await db.update(todos).set({ ...body, updatedAt: new Date() }).where(eq(todos.id, id));
  const updated = await db.query.todos.findFirst({ where: eq(todos.id, id) });
  return NextResponse.json(updated);
};

export const PATCH = PUT;

export const DELETE = async (_req: Request, { params }: { params: { todoId: string } }) => {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number(params.todoId);
  if (Number.isNaN(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await db.delete(todos).where(eq(todos.id, id));
  return NextResponse.json({ success: true });
};
