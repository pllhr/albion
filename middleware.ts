import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";
import db from "./db/drizzle";
import { userProgress } from "./db/schema";
import { eq } from "drizzle-orm";
 
export default authMiddleware({
  async afterAuth(auth, req) {
    if (req.nextUrl.pathname === "/api/seed") {
      return NextResponse.next();
    }

    // Allow public routes defined below
    const publicRoutes = ["/", "/intro", "/ready", "/survey", "/api", "/api/webhooks/stripe", "/api/seed"];

    const pathname = req.nextUrl.pathname;

    // Allow onboarding API to always pass
    if (pathname.startsWith("/api/onboarding")) {
      return;
    }
    if (publicRoutes.some((p) => pathname.startsWith(p))) {
      // Additional gate for intro flow
      if (!auth.userId) return; // not signed in – allow

      const up = (await db.select({ onboardingStep: userProgress.onboardingStep }).from(userProgress).where(eq(userProgress.userId, auth.userId)).limit(1))[0];
      const step = up?.onboardingStep ?? 0;

      // Determine expected page based on step
      const expectedPath = step === 0 ? "/intro" : step === 1 ? "/ready" : step === 2 ? "/survey" : null;
      if (expectedPath && pathname !== expectedPath) {
        return NextResponse.redirect(new URL(expectedPath, req.url));
      }
      return; // Ok
    }

    // For any other route, ensure onboarding completed
    if (auth.userId) {
      const up = (await db.select({ onboardingStep: userProgress.onboardingStep }).from(userProgress).where(eq(userProgress.userId, auth.userId)).limit(1))[0];
      if ((up?.onboardingStep ?? 0) < 3) {
        const redirectTo = up?.onboardingStep === 0 ? "/intro" : up?.onboardingStep === 1 ? "/ready" : "/survey";
        return NextResponse.redirect(new URL(redirectTo, req.url));
      }
    }
  },
  publicRoutes: ["/", "/api/webhooks/stripe", "/intro", "/ready", "/survey", "/api/onboarding", "/api/seed"],
});
 
export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};