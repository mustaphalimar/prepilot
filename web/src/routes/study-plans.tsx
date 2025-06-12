import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateStudyPlanSheet } from "@/features/study-plans/create-study-plan-sheet";
import {
  // CreateTaskRequest,
  StudyPlan,
  StudyTask,
  UpdateTaskRequest,
  useStudyPlans,
  useStudyTasks,
} from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/study-plans")({
  component: StudyPlansPage,
});

function StudyPlansPage() {
  // State for UI controls
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  // const [_, setIsCreateTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  // Custom hooks for business logic
  const studyPlansHook = useStudyPlans();
  const studyTasksHook = useStudyTasks(selectedPlan?.id);

  // Destructure from hooks for cleaner code
  const {
    studyPlans,
    isLoading: isLoadingPlans,
    error: plansError,
    formatDate: formatPlanDate,
    getDaysUntilExam,
    isPlanActive,
  } = studyPlansHook;

  const {
    // createTask,
    updateTask,
    // updateTaskStatus,
    // deleteTask,
    isUpdating: isUpdatingTask,
  } = studyTasksHook;

  // Event handlers

  // const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (!selectedPlan) return;

  //   const formData = new FormData(e.currentTarget);

  //   const task: CreateTaskRequest = {
  //     plan_id: selectedPlan.id,
  //     title: formData.get("title") as string,
  //     due_date: formData.get("due_date") as string,
  //     priority: formData.get("priority")
  //       ? Number(formData.get("priority"))
  //       : undefined,
  //     notes: (formData.get("notes") as string) || undefined,
  //   };

  //   createTask(task, {
  //     onSuccess: () => {
  //       setIsCreateTaskDialogOpen(false);
  //     },
  //   });
  // };

  const handleEditTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;

    const formData = new FormData(e.currentTarget);

    const task: UpdateTaskRequest = {
      title: formData.get("title") as string,
      due_date: formData.get("due_date") as string,
      is_completed: editingTask.is_completed,
      priority: formData.get("priority")
        ? Number(formData.get("priority"))
        : undefined,
      notes: (formData.get("notes") as string) || undefined,
    };

    updateTask(
      { taskId: editingTask.id, task },
      {
        onSuccess: () => {
          setIsEditTaskDialogOpen(false);
          setEditingTask(null);
        },
      },
    );
  };

  // const handleToggleComplete = (taskId: string, currentStatus: boolean) => {
  //   updateTaskStatus({
  //     taskId,
  //     isCompleted: !currentStatus,
  //   });
  // };

  // const handleDeleteTask = (taskId: string) => {
  //   if (confirm("Are you sure you want to delete this task?")) {
  //     deleteTask(taskId);
  //   }
  // };

  // Loading state
  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (plansError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load study plans</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Plans</h1>
          <p className="text-muted-foreground">
            Organize your studies and track your progress
          </p>
        </div>

        {/* <CreateStudyPlanDialog
          isCreatePlanDialogOpen={isCreatePlanDialogOpen}
          setIsCreatePlanDialogOpen={setIsCreatePlanDialogOpen}
        /> */}
        <CreateStudyPlanSheet
          isCreatePlanSheetOpen={isCreatePlanDialogOpen}
          setIsCreatePlanSheetOpen={setIsCreatePlanDialogOpen}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Study Plans List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Your Study Plans</h2>
          {studyPlans?.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Study Plans</CardTitle>
                <CardDescription>
                  Create your first study plan to get started
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-3">
              {studyPlans?.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPlan?.id === plan.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm">{plan.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {plan.subject}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {isPlanActive(plan) && (
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {formatPlanDate(plan.exam_date)}
                      </div>
                      <div className="text-xs">
                        {getDaysUntilExam(plan.exam_date)} days
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog
        open={isEditTaskDialogOpen}
        onOpenChange={setIsEditTaskDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update your task details</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <form onSubmit={handleEditTask} className="space-y-4">
              <div>
                <Label htmlFor="edit-task-title">Title</Label>
                <Input
                  id="edit-task-title"
                  name="title"
                  defaultValue={editingTask.title}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-task-due_date">Due Date</Label>
                <Input
                  id="edit-task-due_date"
                  name="due_date"
                  type="datetime-local"
                  defaultValue={editingTask.due_date.slice(0, 16)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select
                  name="priority"
                  defaultValue={editingTask.priority?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-task-notes">Notes</Label>
                <Textarea
                  id="edit-task-notes"
                  name="notes"
                  defaultValue={editingTask.notes || ""}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditTaskDialogOpen(false);
                    setEditingTask(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingTask}>
                  {isUpdatingTask ? "Updating..." : "Update Task"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
