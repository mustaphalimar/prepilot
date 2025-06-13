"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";

// Public routes that don't require authentication

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For protected routes, only render if user is authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-600">
              Please sign in to start your exam preparation journey
            </p>
            <div className="flex gap-4 items-center">
              <SignInButton mode="redirect">
                <Button>Sign In</Button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <Button>Sign Up</Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user accessing protected routes - show full layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="overflow-auto  m-2  rounded-xl border shadow">
          <SiteHeader />
          <div className="bg-white max-h-[92vh] overflow-y-scroll dark:bg-background">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
