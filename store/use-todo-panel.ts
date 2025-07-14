import { create } from "zustand";

interface TodoPanelState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useTodoPanel = create<TodoPanelState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
