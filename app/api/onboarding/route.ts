import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import db from "../../../db/drizzle";
import { userProgress } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { step } = await req.json();
  if (typeof step !== "number" || step < 0 || step > 3)
    return new NextResponse("Invalid step", { status: 400 });

  const existing = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: { userId: true },
  });

  if (existing) {
    await db
      .update(userProgress)
      .set({ onboardingStep: step })
      .where(eq(userProgress.userId, userId));
  } else {
    await db.insert(userProgress).values({ userId, onboardingStep: step });
  }

  return NextResponse.json({ ok: true });
}
