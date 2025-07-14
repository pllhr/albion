import { redirect } from "next/navigation";

import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { lessons, units as unitsSchema } from "@/db/schema";
import { 
  getCourseProgress, 
  getLessonPercentage, 
  getUnits, 
  getUserProgress,
  getUserSubscription
} from "@/db/queries";

import { Unit } from "./unit";
import { UnitDivider } from "./unit-divider";
import { getCourseColors } from "@/utils/course-colors";
import { getCourseFlag } from "@/utils/course-flags";
import { FloatingTodoButton } from "@/components/todo/floating-todo-button";
import { TodoSidePanel } from "@/components/todo/todo-side-panel";
import { TodoEditorModal } from "@/components/todo/todo-editor-modal";
import { LanguagePickerModal } from "@/components/language-picker-modal";
import { Lang } from "@/utils/i18n";

const LearnPage = async () => {
  

  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();
  const lessonPercentageData = getLessonPercentage();
  const unitsData = getUnits();
  const userSubscriptionData = getUserSubscription();

  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubscription,
  ] = await Promise.all([
    userProgressData,
    unitsData,
    courseProgressData,
    lessonPercentageData,
    userSubscriptionData,

  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  if (!courseProgress) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          crystals={userProgress.crystals}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isPro && (
          <Promo />
        )}
        <Quests points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        
        {units.map((unit) => {
          if (unit.isDivider) {
            return (
              <UnitDivider
                key={`divider-${unit.id}`}
                text={unit.description}
              />
            );
          }

          return (
            <div key={unit.id} className="mb-10">
              <Unit
                id={unit.id}
                order={unit.order}
                description={unit.description}
                title={unit.title}
                lessons={unit.lessons}
                activeLesson={courseProgress.activeLesson as typeof lessons.$inferSelect & {
                  unit: typeof unitsSchema.$inferSelect;
                } | undefined}
                activeLessonPercentage={lessonPercentage}
                courseColors={getCourseColors(userProgress.activeCourse!.title)}
                flagSrc={getCourseFlag(userProgress.activeCourse!.title)}
                lang={(userProgress.uiLanguage ?? "en") as Lang}
              />
            </div>
          );
        })}
      </FeedWrapper>
      <FloatingTodoButton courseId={userProgress.activeCourse.id} />
      <TodoSidePanel courseId={userProgress.activeCourse.id} />
      <TodoEditorModal courseId={userProgress.activeCourse.id} />
      <LanguagePickerModal courseId={userProgress.activeCourse.id} open={!userProgress.uiLanguage} defaultLang={null} />
    </div>
  );
};
 
export default LearnPage;
