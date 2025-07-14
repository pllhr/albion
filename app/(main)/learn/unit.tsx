import { lessons, units } from "@/db/schema"

import { UnitBanner } from "./unit-banner";
import { Lang } from "@/utils/i18n";
import { LessonButton } from "./lesson-button";

type Props = {
  id: number;
  order: number;
  title: string;
  description: string;
  lessons: (typeof lessons.$inferSelect & {
    completed: boolean;
  })[];
  activeLesson: typeof lessons.$inferSelect & {
    unit: typeof units.$inferSelect;
  } | undefined;
  activeLessonPercentage: number;
  courseColors: string[];
  flagSrc?: string | null;
  lang: Lang;
};

export const Unit = ({
  id,
  order,
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
  courseColors,
  flagSrc,
  lang,
}: Props) => {
  return (
    <>
      {
        /* calcular seção (8 unidades por seção) */
      }
      <UnitBanner
        title={title}
        description={description}
        sectionNumber={Math.floor((order - 1) / 8) + 1}
        unitNumber={order}
        colors={courseColors}
        flagSrc={flagSrc || undefined}
         lang={lang}
      />
      <div className="flex items-center flex-col relative">
        {lessons.map((lesson, index) => {
          const previousCompleted = index === 0 ? true : lessons[index - 1].completed;
          const isLocked = !previousCompleted;
          const isCurrent = !isLocked && !lesson.completed;

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={index}
              totalCount={lessons.length - 1}
              current={isCurrent}
              locked={isLocked}
              completed={lesson.completed}
              percentage={activeLessonPercentage}
              title={lesson.title}
              lessonNumber={lesson.order}
              totalLessons={lessons.length}
            />
          );
        })}
      </div>
    </>
  );
};
