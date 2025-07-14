import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { userId: requestedUserId } = await req.json();
  if (requestedUserId !== userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: { onboardingStep: true }
  });

  return NextResponse.json(progress || { onboardingStep: 0 });
}
