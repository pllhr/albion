import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function middleware(request: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.next();

  // Check if user is trying to access intro or survey pages
  const isTutorialPath = request.nextUrl.pathname.startsWith('/intro') || 
    request.nextUrl.pathname.startsWith('/survey');

  if (isTutorialPath) {
    // Check if user has an active course
    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      columns: { onboardingStep: true, activeCourseId: true }
    });

    if (progress?.activeCourseId && progress?.onboardingStep >= 1) {
      // User has an active course and has started onboarding
      const redirectPath = progress.onboardingStep >= 3 ? '/lesson' : '/learn';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
