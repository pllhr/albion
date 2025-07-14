import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET = async () => {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  return NextResponse.json({ crystals: progress?.crystals ?? 0 });
};

interface PatchBody {
  amount: number; // positive to add, negative to spend
}

export const PATCH = async (req: Request) => {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { amount } = (await req.json()) as PatchBody;
  if (typeof amount !== "number") {
    return NextResponse.json({ error: "invalid amount" }, { status: 400 });
  }

  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (!progress) {
    return NextResponse.json({ error: "progress not found" }, { status: 404 });
  }

  const newTotal = Math.max(0, progress.crystals + amount);
  await db
    .update(userProgress)
    .set({ crystals: newTotal })
    .where(eq(userProgress.userId, userId));

  return NextResponse.json({ crystals: newTotal });
};
