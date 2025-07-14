import { redirect } from "next/navigation";
import { getUserProgress, getUserCoursesProgress } from "@/db/queries";
import { ProfileClient } from "./profile-client";
import { auth } from "@clerk/nextjs";

export default async function ProfilePage() {
  const { user } = auth();
  const userProgress = await getUserProgress();
  const courses = await getUserCoursesProgress();
  if (!userProgress) redirect("/courses");

  return (
    <ProfileClient
      userProgress={{
        ...userProgress,
        createdAt: user ? new Date(user.createdAt) : undefined,
      }}
      courses={courses}
    />
  );
}