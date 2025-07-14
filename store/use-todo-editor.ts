import { create } from "zustand";

interface TodoEditorState {
  isOpen: boolean;
  todoId: number | null;
  open: (id?: number) => void;
  close: () => void;
}

export const useTodoEditor = create<TodoEditorState>((set) => ({
  isOpen: false,
  todoId: null,
  open: (id) => set({ isOpen: true, todoId: id ?? null }),
  close: () => set({ isOpen: false, todoId: null }),
}));
