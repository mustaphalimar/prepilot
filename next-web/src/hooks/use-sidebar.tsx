import { create } from "zustand";

export interface UseSidebar {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useSidebar = create<UseSidebar>((set) => ({
  open: false,

  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),
}));
