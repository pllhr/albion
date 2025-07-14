"use client";

import { ClipboardList } from "lucide-react";
import { useTodoPanel } from "@/store/use-todo-panel";
import { cn } from "@/lib/utils";

interface FloatingTodoButtonProps {
  courseId: number;
}

export const FloatingTodoButton = ({ courseId }: FloatingTodoButtonProps) => {
  const { open } = useTodoPanel();

  return (
    <button
      type="button"
      aria-label="Abrir lista de tarefas"
      onClick={open}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-[#58cc02] text-white shadow-lg hover:brightness-110 active:scale-95 transition"
      )}
    >
      <ClipboardList className="h-6 w-6" />
    </button>
  );
};
