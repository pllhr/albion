"use client";

import { toast } from "sonner";
import { useTransition } from "react";
import { memo } from "react";
import { useRouter } from "next/navigation";

import { courses, userProgress } from "@/db/schema";
import { upsertUserProgress } from "@/actions/user-progress";

import { Card } from "./card";

type Props = {
  courses: typeof courses.$inferSelect[];
  activeCourseId?: number;

};

export const List = ({ courses, activeCourseId }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = (id: number) => {
    if (pending) return;

    if (id === activeCourseId) {
      return router.push("/learn");
    }

    startTransition(() => {
      upsertUserProgress(id)
        .then(() => router.push("/learn"))
        .catch(() => {
          toast.error("Algo deu errado ao selecionar o curso.");
        });
    });
  };

  return (
    <div className="pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          imageSrc={course.imageSrc}
          learnersCount={course.learnersCount.toString()}
          onClick={onClick}
          disabled={pending}
          active={course.id === activeCourseId}

        />
      ))}
    </div>
  );
};
