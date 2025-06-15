"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { useScheduleExamSheet } from "../hooks/use-schedule-exam-sheet";

interface Props {
  isCreatePlanSheetOpen: boolean;
  setIsCreatePlanSheetOpen: (v: boolean) => void;
}

export const CreateStudyPlanSheet: React.FC<Props> = ({
  isCreatePlanSheetOpen,
  setIsCreatePlanSheetOpen,
}) => {
  const scheduleExamSheet = useScheduleExamSheet();

  const handleCreatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatePlanSheetOpen(false);
    scheduleExamSheet.setSubject("Subject");
    scheduleExamSheet.onOpenChange(true);
    // const formData = new FormData(e.currentTarget);
  };

  return (
    <Sheet open={isCreatePlanSheetOpen} onOpenChange={setIsCreatePlanSheetOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          <span className="font-semibold">Create Plan</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="md:min-w-xl">
        <SheetHeader className="px-2">
          <SheetTitle className="text-xl font-bold">
            Create New Study Plan
          </SheetTitle>
          <SheetDescription>
            Set up a new study plan for your exam preparation.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleCreatePlan} className="px-4 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Enter plan title" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" placeholder="Enter subject" />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
