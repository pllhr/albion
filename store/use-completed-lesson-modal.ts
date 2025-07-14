import { create } from "zustand";

interface CompletedLessonModalState {
  isOpen: boolean;
  lessonId: number | null;
  lessonTitle: string;
  open: (lessonId: number, lessonTitle: string) => void;
  close: () => void;
}

export const useCompletedLessonModal = create<CompletedLessonModalState>((set) => ({
  isOpen: false,
  lessonId: null,
  lessonTitle: "",
  open: (lessonId, lessonTitle) =>
    set({ isOpen: true, lessonId, lessonTitle }),
  close: () => set({ isOpen: false, lessonId: null, lessonTitle: "" }),
}));
