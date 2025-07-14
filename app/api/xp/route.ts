import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { eq, sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount } = body as { amount: number };

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    await db
      .update(userProgress)
      .set({ points: sql`${userProgress.points} + ${amount}` })
      .where(eq(userProgress.userId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar XP:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
