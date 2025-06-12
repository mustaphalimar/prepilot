import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { CreateStudyPlanRequest, useStudyPlans } from "@/hooks";
import { Plus } from "lucide-react";
import { useState } from "react";

interface Props {
  isCreatePlanSheetOpen: boolean;
  setIsCreatePlanSheetOpen: (v: boolean) => void;
}

export const CreateStudyPlanSheet: React.FC<Props> = ({
  isCreatePlanSheetOpen,
  setIsCreatePlanSheetOpen,
}) => {
  const studyPlansHook = useStudyPlans();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [examDate, setExamDate] = useState<Date | undefined>(new Date());

  // Destructure from hooks for cleaner code
  const { createPlan, isCreating: isCreatingPlan } = studyPlansHook;

  const handleCreatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const plan: CreateStudyPlanRequest = {
      title: formData.get("title") as string,
      subject: formData.get("subject") as string,
      description: (formData.get("description") as string) || undefined,
      exam_date: formData.get("exam_date") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
    };

    createPlan(plan, {
      onSuccess: () => {
        setIsCreatePlanSheetOpen(false);
      },
    });
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
            <Input
              id="title"
              name="title"
              placeholder="Enter plan title"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Enter subject"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your study plan"
              rows={3}
            />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="grid grid-cols-2 gap-2 ">
              <div className="space-y-1">
                <Label htmlFor="start_date">Start Date</Label>

                <DatePicker date={startDate} setDate={setStartDate} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end_date">End Date</Label>

                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="exam_date">Exam Date</Label>

              <DatePicker date={examDate} setDate={setExamDate} />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreatePlanSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingPlan}>
              {isCreatingPlan ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
