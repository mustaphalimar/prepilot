import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { env } from "@/lib/env";
import { z } from "zod";

export const createStudyPlanFormSchema = z
  .object({
    title: z.string().min(3).max(100),
    subject: z.string().min(2).max(50),
    description: z.string().max(500).optional(),
    examDate: z.coerce.date(), // handles string to Date
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Start date must be before or equal to end date",
    path: ["endDate"],
  })
  .refine((data) => data.endDate <= data.examDate, {
    message: "End date must be before or equal to exam date",
    path: ["examDate"],
  });

export type CreateStudyPlanSchema = z.infer<typeof createStudyPlanFormSchema>;

// Types
export interface StudyPlan {
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

export interface CreateStudyPlanRequest {
  title: string;
  subject: string;
  description?: string;
  exam_date: string;
  start_date: string;
  end_date: string;
}

interface StudyPlansResponse {
  data: StudyPlan[];
}

interface StudyPlanResponse {
  data: StudyPlan;
}

// API functions
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

  const result: StudyPlansResponse = await response.json();
  return result.data || [];
}

async function createStudyPlan(
  token: string,
  plan: CreateStudyPlanRequest,
): Promise<StudyPlan> {
  const response = await fetch(`${env.apiUrl}/v1/study-plans`, {
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

  const result: StudyPlanResponse = await response.json();
  return result.data || result;
}

async function fetchStudyPlan(
  token: string,
  planId: string,
): Promise<StudyPlan> {
  const response = await fetch(`${env.apiUrl}/v1/study-plans/${planId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch study plan");
  }

  const result: StudyPlanResponse = await response.json();
  return result.data || result;
}

// Custom hook
export function useStudyPlans() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all study plans
  const studyPlansQuery = useQuery({
    queryKey: ["study-plans"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return fetchStudyPlans(token);
    },
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
    },
  });

  // Get specific study plan
  const useGetStudyPlan = (planId: string) => {
    return useQuery({
      queryKey: ["study-plan", planId],
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error("No authentication token");
        return fetchStudyPlan(token, planId);
      },
      enabled: !!planId,
    });
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilExam = (examDate: string) => {
    const exam = new Date(examDate);
    const today = new Date();
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isPlanActive = (plan: StudyPlan) => {
    const today = new Date();
    const startDate = new Date(plan.start_date);
    const endDate = new Date(plan.end_date);
    return today >= startDate && today <= endDate;
  };

  const isPlanUpcoming = (plan: StudyPlan) => {
    const today = new Date();
    const startDate = new Date(plan.start_date);
    return today < startDate;
  };

  const isPlanCompleted = (plan: StudyPlan) => {
    const today = new Date();
    const endDate = new Date(plan.end_date);
    return today > endDate;
  };

  return {
    // Data
    studyPlans: studyPlansQuery.data || [],

    // Loading states
    isLoading: studyPlansQuery.isLoading,
    isCreating: createPlanMutation.isPending,

    // Error states
    error: studyPlansQuery.error,
    createError: createPlanMutation.error,

    // Mutations
    createPlan: createPlanMutation.mutate,

    // Query functions
    getStudyPlan: useGetStudyPlan,

    // Helper functions
    formatDate,
    getDaysUntilExam,
    isPlanActive,
    isPlanUpcoming,
    isPlanCompleted,

    // Refetch
    refetch: studyPlansQuery.refetch,
  };
}
