"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCompletedLessonModal } from "@/store/use-completed-lesson-modal";

export const CompletedLessonModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close, lessonId, lessonTitle } = useCompletedLessonModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  const handleXpUpdate = async (xp: number) => {
    try {
      await fetch("/api/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: xp }),
      });
    } catch (e) {
      console.error("Erro ao atualizar XP", e);
    }
  };

  const handleCrystalsUpdate = async (amount: number = 5) => {
    try {
      await fetch("/api/crystals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
    } catch (e) {
      console.error("Erro ao atualizar cristais", e);
    }
  };

  const onPractice = async () => {
    await Promise.all([
      handleXpUpdate(5),
      handleCrystalsUpdate(5),
    ]);
    close();
    if (lessonId) router.push(`/lesson/${lessonId}`);
  };

  const onTitans = async () => {
    await Promise.all([
      handleXpUpdate(40),
      handleCrystalsUpdate(5),
    ]);
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="lesson_completed" alt="Completo" height={120} width={120} />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
            {lessonTitle}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Escolha uma opção para continuar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button variant="primary" className="w-full" size="lg" onClick={onPractice}>
              PRATICAR (+5 XP)
            </Button>
            <Button variant="primaryOutline" className="w-full" size="lg" onClick={onTitans}>
              TITÃS (+40 XP)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompletedLessonModal;
