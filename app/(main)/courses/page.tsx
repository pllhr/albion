import { List } from "./list";
import db from "@/db/drizzle";
import { getCourses, getUserProgress } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

const CoursesPage = async () => {
  const coursesData = getCourses();
  const userProgressData = getUserProgress();

  const [
    courses,
    userProgress,
  ] = await Promise.all([
    coursesData,
    userProgressData,
  ]);

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="font-headline text-3xl lg:text-5xl text-[#000000] mb-8 text-center">
        Escolha um curso
      </h1>
      <List
        courses={courses}
        activeCourseId={userProgress?.activeCourseId ?? undefined}
      />
    </div>
  );
};

export default CoursesPage;
