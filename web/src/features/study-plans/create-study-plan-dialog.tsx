import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateStudyPlanRequest, useStudyPlans } from "@/hooks";
import { Plus } from "lucide-react";
import { useState } from "react";

interface Props {
  isCreatePlanDialogOpen: boolean;
  setIsCreatePlanDialogOpen: (v: boolean) => void;
}

export const CreateStudyPlanDialog: React.FC<Props> = ({
  isCreatePlanDialogOpen,
  setIsCreatePlanDialogOpen,
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
        setIsCreatePlanDialogOpen(false);
      },
    });
  };

  return (
    <Dialog
      open={isCreatePlanDialogOpen}
      onOpenChange={setIsCreatePlanDialogOpen}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          <span className="font-semibold">Create Plan</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Study Plan</DialogTitle>
          <DialogDescription>
            Set up a new study plan for your exam preparation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreatePlan} className="space-y-4">
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="start_date">Start Date</Label>

              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end_date">End Date</Label>

              <DatePicker date={endDate} setDate={setEndDate} />
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
              onClick={() => setIsCreatePlanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingPlan}>
              {isCreatingPlan ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
