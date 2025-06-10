import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { env } from "@/lib/env";

// Types
export interface StudyTask {
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

export interface CreateTaskRequest {
  plan_id?: string;
  title: string;
  due_date: string;
  is_completed?: boolean;
  priority?: number;
  notes?: string;
}

export interface UpdateTaskRequest {
  title: string;
  due_date: string;
  is_completed: boolean;
  priority?: number;
  notes?: string;
}

interface StudyTasksResponse {
  data: StudyTask[];
}

interface StudyTaskResponse {
  data: StudyTask;
}

// API functions
async function fetchStudyPlanTasks(token: string, planId: string): Promise<StudyTask[]> {
  const response = await fetch(`${env.apiUrl}/v1/study-plans/${planId}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch study plan tasks");
  }

  const result: StudyTasksResponse = await response.json();
  return result.data || result || [];
}

async function createStudyTask(
  token: string,
  task: CreateTaskRequest
): Promise<StudyTask> {
  const response = await fetch(`${env.apiUrl}/v1/study-tasks`, {
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

  const result: StudyTaskResponse = await response.json();
  return result.data || result;
}

async function updateStudyTask(
  token: string,
  taskId: string,
  task: UpdateTaskRequest
): Promise<StudyTask> {
  const response = await fetch(`${env.apiUrl}/v1/study-tasks/${taskId}`, {
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

  const result: StudyTaskResponse = await response.json();
  return result.data || result;
}

async function updateTaskStatus(
  token: string,
  taskId: string,
  isCompleted: boolean
): Promise<void> {
  const response = await fetch(`${env.apiUrl}/v1/study-tasks/${taskId}/status`, {
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
  const response = await fetch(`${env.apiUrl}/v1/study-tasks/${taskId}`, {
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

// Custom hook
export function useStudyTasks(planId?: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Fetch tasks for a specific plan
  const tasksQuery = useQuery({
    queryKey: ["study-plan-tasks", planId],
    queryFn: async () => {
      if (!planId) return [];
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return fetchStudyPlanTasks(token, planId);
    },
    enabled: !!planId,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: CreateTaskRequest) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return createStudyTask(token, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plan-tasks", planId] });
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
      queryClient.invalidateQueries({ queryKey: ["study-plan-tasks", planId] });
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
      queryClient.invalidateQueries({ queryKey: ["study-plan-tasks", planId] });
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
      queryClient.invalidateQueries({ queryKey: ["study-plan-tasks", planId] });
    },
  });

  // Helper functions
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
    return (tasksQuery.data || []).filter(task => task.is_completed).length;
  };

  const getTotalTasksCount = () => {
    return (tasksQuery.data || []).length;
  };

  const getProgressPercentage = () => {
    const total = getTotalTasksCount();
    if (total === 0) return 0;
    return Math.round((getCompletedTasksCount() / total) * 100);
  };

  const getPendingTasks = () => {
    return (tasksQuery.data || []).filter(task => !task.is_completed);
  };

  const getCompletedTasks = () => {
    return (tasksQuery.data || []).filter(task => task.is_completed);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return (tasksQuery.data || []).filter(task => {
      const dueDate = new Date(task.due_date);
      return !task.is_completed && dueDate < now;
    });
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return (tasksQuery.data || []).filter(task => {
      const dueDate = new Date(task.due_date);
      return !task.is_completed && dueDate >= now && dueDate <= nextWeek;
    });
  };

  const isTaskOverdue = (task: StudyTask) => {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    return !task.is_completed && dueDate < now;
  };

  return {
    // Data
    tasks: tasksQuery.data || [],
    
    // Loading states
    isLoading: tasksQuery.isLoading,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    
    // Error states
    error: tasksQuery.error,
    createError: createTaskMutation.error,
    updateError: updateTaskMutation.error,
    deleteError: deleteTaskMutation.error,
    
    // Mutations
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    updateTaskStatus: updateStatusMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    
    // Helper functions
    formatDate,
    getPriorityColor,
    getPriorityLabel,
    getCompletedTasksCount,
    getTotalTasksCount,
    getProgressPercentage,
    getPendingTasks,
    getCompletedTasks,
    getOverdueTasks,
    getUpcomingTasks,
    isTaskOverdue,
    
    // Refetch
    refetch: tasksQuery.refetch,
  };
}