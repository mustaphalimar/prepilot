import { create } from "zustand";

export interface UseScheduleExamSheet {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  setSubject: (s: string) => void;
}

export const useScheduleExamSheet = create<UseScheduleExamSheet>((set) => ({
  open: false,
  subject: "",
  onOpenChange: (open) => set({ open: open }),
  setSubject: (s) => set({ subject: s }),
}));
