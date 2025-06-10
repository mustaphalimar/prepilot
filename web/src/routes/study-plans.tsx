import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  CheckCircle,
  Circle,
  Trash2,
  Edit3,
  BookOpen,
  Target,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStudyPlans,
  useStudyTasks,
  StudyPlan,
  StudyTask,
  CreateStudyPlanRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/hooks";
import { DatePicker } from "@/components/ui/date-picker";

export const Route = createFileRoute("/study-plans")({
  component: StudyPlansPage,
});

function StudyPlansPage() {
  // State for UI controls
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
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
    createPlan,
    isCreating: isCreatingPlan,
    formatDate: formatPlanDate,
    getDaysUntilExam,
    isPlanActive,
  } = studyPlansHook;

  const {
    tasks,
    isLoading: isLoadingTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    isCreating: isCreatingTask,
    isUpdating: isUpdatingTask,
    isUpdatingStatus: isUpdatingTaskStatus,
    isDeleting: isDeletingTask,
    formatDate: formatTaskDate,
    getPriorityColor,
    getPriorityLabel,
    getCompletedTasksCount,
    getTotalTasksCount,
    getProgressPercentage,
  } = studyTasksHook;

  // Event handlers
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

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const formData = new FormData(e.currentTarget);

    const task: CreateTaskRequest = {
      plan_id: selectedPlan.id,
      title: formData.get("title") as string,
      due_date: formData.get("due_date") as string,
      priority: formData.get("priority")
        ? Number(formData.get("priority"))
        : undefined,
      notes: (formData.get("notes") as string) || undefined,
    };

    createTask(task, {
      onSuccess: () => {
        setIsCreateTaskDialogOpen(false);
      },
    });
  };

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

  const handleToggleComplete = (taskId: string, currentStatus: boolean) => {
    updateTaskStatus({
      taskId,
      isCompleted: !currentStatus,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };

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

        <Dialog
          open={isCreatePlanDialogOpen}
          onOpenChange={setIsCreatePlanDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
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
                  <div className="max-w-[100px]">
                    <DatePicker />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="end_date">End Date</Label>
                  <div className="max-w-[100px]">
                    <DatePicker />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="exam_date">Exam Date</Label>
                  <div className="max-w-[100px]">
                    <DatePicker />
                  </div>
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

        {/* Study Plan Details and Tasks */}
        <div className="lg:col-span-2">
          {selectedPlan ? (
            <div className="space-y-6">
              {/* Plan Overview */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedPlan.title}</CardTitle>
                      <CardDescription>{selectedPlan.subject}</CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center mb-1">
                        <Target className="mr-1 h-3 w-3" />
                        Exam: {formatPlanDate(selectedPlan.exam_date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatPlanDate(selectedPlan.start_date)} -{" "}
                        {formatPlanDate(selectedPlan.end_date)}
                      </div>
                    </div>
                  </div>
                  {selectedPlan.description && (
                    <CardDescription className="mt-2">
                      {selectedPlan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Progress: {getCompletedTasksCount()} of{" "}
                      {getTotalTasksCount()} tasks completed
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${getProgressPercentage()}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Study Tasks</h3>
                  <Dialog
                    open={isCreateTaskDialogOpen}
                    onOpenChange={setIsCreateTaskDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                          Add a task to {selectedPlan.title}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateTask} className="space-y-4">
                        <div>
                          <Label htmlFor="task-title">Title</Label>
                          <Input
                            id="task-title"
                            name="title"
                            placeholder="Enter task title"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="task-due_date">Due Date</Label>
                          <Input
                            id="task-due_date"
                            name="due_date"
                            type="datetime-local"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="task-priority">Priority</Label>
                          <Select name="priority">
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
                          <Label htmlFor="task-notes">Notes</Label>
                          <Textarea
                            id="task-notes"
                            name="notes"
                            placeholder="Add any additional notes"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateTaskDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isCreatingTask}>
                            {isCreatingTask ? "Creating..." : "Create Task"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {isLoadingTasks ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : tasks.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Tasks Yet</CardTitle>
                      <CardDescription>
                        Add tasks to track your study progress
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <Card key={task.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <button
                                onClick={() =>
                                  handleToggleComplete(
                                    task.id,
                                    task.is_completed,
                                  )
                                }
                                className="mt-1"
                                disabled={isUpdatingTaskStatus}
                              >
                                {task.is_completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                              <div>
                                <CardTitle
                                  className={`text-sm ${
                                    task.is_completed
                                      ? "line-through text-gray-500"
                                      : ""
                                  }`}
                                >
                                  {task.title}
                                </CardTitle>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                                  <div className="flex items-center">
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    {formatTaskDate(task.due_date)}
                                  </div>
                                  {task.priority && (
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                        task.priority,
                                      )}`}
                                    >
                                      {getPriorityLabel(task.priority)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTask(task);
                                  setIsEditTaskDialogOpen(true);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={isDeletingTask}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {task.notes && (
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              {task.notes}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Study Plan</CardTitle>
                <CardDescription>
                  Choose a study plan from the left to view its details and
                  tasks
                </CardDescription>
              </CardHeader>
            </Card>
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
