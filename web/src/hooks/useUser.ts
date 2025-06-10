import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { env } from "@/lib/env";

// Types
interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  email_verified: boolean;
  last_sign_in?: string;
  created_at: string;
  updated_at: string;
}

interface UserResponse {
  data: User;
}

// API functions
async function initializeUser(token: string): Promise<User> {
  const response = await fetch(`${env.apiUrl}/v1/user/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to initialize user");
  }

  const result: UserResponse = await response.json();
  return result.data;
}

async function fetchUserProfile(token: string): Promise<User> {
  const response = await fetch(`${env.apiUrl}/v1/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const result: UserResponse = await response.json();
  return result.data;
}

// Custom hook
export function useUser() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  // Initialize user in database after sign-in
  const initializeQuery = useQuery({
    queryKey: ["user-initialize"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return initializeUser(token);
    },
    enabled: isSignedIn && isLoaded,
    retry: 2,
    staleTime: Infinity, // Only run once per session
  });

  // Get user profile
  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return fetchUserProfile(token);
    },
    enabled: isSignedIn && isLoaded && initializeQuery.isSuccess,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    // User data
    user: profileQuery.data,
    isInitialized: initializeQuery.isSuccess,
    
    // Loading states
    isInitializing: initializeQuery.isLoading,
    isLoadingProfile: profileQuery.isLoading,
    isLoading: initializeQuery.isLoading || profileQuery.isLoading,
    
    // Error states
    initializeError: initializeQuery.error,
    profileError: profileQuery.error,
    error: initializeQuery.error || profileQuery.error,
    
    // Status checks
    isReady: isSignedIn && isLoaded && initializeQuery.isSuccess,
    
    // Refetch functions
    refetchProfile: profileQuery.refetch,
  };
}