import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import {
  Plus,
  Calendar,
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
import { env } from "@/lib/env";
export const Route = createFileRoute("/study-plans")({
  component: StudyPlansPage,
});

// Types
interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  description?: string;
  exam_date: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface StudyTask {
  id: string;
  plan_id?: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  priority?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface CreateStudyPlanRequest {
  title: string;
  subject: string;
  description?: string;
  exam_date: string;
  start_date: string;
  end_date: string;
}

interface CreateTaskRequest {
  plan_id?: string;
  title: string;
  due_date: string;
  is_completed?: boolean;
  priority?: number;
  notes?: string;
}

interface UpdateTaskRequest {
  title: string;
  due_date: string;
  is_completed: boolean;
  priority?: number;
  notes?: string;
}

async function fetchStudyPlans(token: string): Promise<StudyPlan[]> {
  const response = await fetch(`${env.apiUrl}/v1/study-plans`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch study plans");
  }

  return response.json();
}

async function createStudyPlan(
  token: string,
  plan: CreateStudyPlanRequest,
): Promise<StudyPlan> {
  const response = await fetch(`${env.apiUrl}/study-plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(plan),
  });

  if (!response.ok) {
    throw new Error("Failed to create study plan");
  }

  return response.json();
}

async function fetchStudyPlanTasks(
  token: string,
  planId: string,
): Promise<StudyTask[]> {
  const response = await fetch(`${env.apiUrl}/study-plans/${planId}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch study plan tasks");
  }

  return response.json();
}

async function createStudyTask(
  token: string,
  task: CreateTaskRequest,
): Promise<StudyTask> {
  const response = await fetch(`${env.apiUrl}/study-tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Failed to create study task");
  }

  return response.json();
}

async function updateStudyTask(
  token: string,
  taskId: string,
  task: UpdateTaskRequest,
): Promise<StudyTask> {
  const response = await fetch(`${env.apiUrl}/study-tasks/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Failed to update study task");
  }

  return response.json();
}

async function updateTaskStatus(
  token: string,
  taskId: string,
  isCompleted: boolean,
): Promise<void> {
  const response = await fetch(`${env.apiUrl}/study-tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_completed: isCompleted }),
  });

  if (!response.ok) {
    throw new Error("Failed to update task status");
  }
}

async function deleteStudyTask(token: string, taskId: string): Promise<void> {
  const response = await fetch(`${env.apiUrl}/study-tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete study task");
  }
}

function StudyPlansPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  // Fetch study plans
  const {
    data: studyPlans = [],
    isLoading: isLoadingPlans,
    error: plansError,
  } = useQuery({
    queryKey: ["study-plans"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return fetchStudyPlans(token);
    },
  });

  // Fetch tasks for selected plan
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["study-plan-tasks", selectedPlan?.id],
    queryFn: async () => {
      if (!selectedPlan) return [];
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return fetchStudyPlanTasks(token, selectedPlan.id);
    },
    enabled: !!selectedPlan,
  });

  // Create study plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (plan: CreateStudyPlanRequest) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return createStudyPlan(token, plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      setIsCreatePlanDialogOpen(false);
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: CreateTaskRequest) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return createStudyTask(token, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["study-plan-tasks", selectedPlan?.id],
      });
      setIsCreateTaskDialogOpen(false);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      task,
    }: {
      taskId: string;
      task: UpdateTaskRequest;
    }) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return updateStudyTask(token, taskId, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["study-plan-tasks", selectedPlan?.id],
      });
      setIsEditTaskDialogOpen(false);
      setEditingTask(null);
    },
  });

  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      taskId,
      isCompleted,
    }: {
      taskId: string;
      isCompleted: boolean;
    }) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return updateTaskStatus(token, taskId, isCompleted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["study-plan-tasks", selectedPlan?.id],
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return deleteStudyTask(token, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["study-plan-tasks", selectedPlan?.id],
      });
    },
  });

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

    createPlanMutation.mutate(plan);
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

    createTaskMutation.mutate(task);
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

    updateTaskMutation.mutate({ taskId: editingTask.id, task });
  };

  const handleToggleComplete = (taskId: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({
      taskId,
      isCompleted: !currentStatus,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority?: number) => {
    switch (priority) {
      case 1:
        return "text-red-600 bg-red-50";
      case 2:
        return "text-yellow-600 bg-yellow-50";
      case 3:
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityLabel = (priority?: number) => {
    switch (priority) {
      case 1:
        return "High";
      case 2:
        return "Medium";
      case 3:
        return "Low";
      default:
        return "None";
    }
  };

  const getCompletedTasksCount = () => {
    return tasks.filter((task) => task.is_completed).length;
  };

  const getTotalTasksCount = () => {
    return tasks.length;
  };

  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter plan title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Enter subject"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your study plan"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" name="end_date" type="date" required />
                </div>
                <div>
                  <Label htmlFor="exam_date">Exam Date</Label>
                  <Input id="exam_date" name="exam_date" type="date" required />
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
                <Button type="submit" disabled={createPlanMutation.isPending}>
                  {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
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
          {studyPlans.length === 0 ? (
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
              {studyPlans.map((plan) => (
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
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(plan.exam_date)}
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
                        Exam: {formatDate(selectedPlan.exam_date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(selectedPlan.start_date)} -{" "}
                        {formatDate(selectedPlan.end_date)}
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
                          width:
                            getTotalTasksCount() > 0
                              ? `${(getCompletedTasksCount() / getTotalTasksCount()) * 100}%`
                              : "0%",
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
                          <Button
                            type="submit"
                            disabled={createTaskMutation.isPending}
                          >
                            {createTaskMutation.isPending
                              ? "Creating..."
                              : "Create Task"}
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
                                disabled={updateStatusMutation.isPending}
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
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {formatDate(task.due_date)}
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
                                disabled={deleteTaskMutation.isPending}
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
                <Button type="submit" disabled={updateTaskMutation.isPending}>
                  {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
