import {
  createRootRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Public routes that don't require authentication
const publicRoutes = ["/auth", "/"];

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export const Route = createRootRoute({
  component: RootComponent,
});

function AuthWrapper() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    if (isLoaded && !isSignedIn && !isPublicRoute) {
      navigate({ to: "/auth", replace: true });
    }
  }, [isSignedIn, isLoaded, navigate, isPublicRoute]);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin-fast rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For public routes (auth and home), render without sidebar
  if (isPublicRoute) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  // For protected routes, only render if user is authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Please sign in to continue...</p>
        </div>
      </div>
    );
  }

  // Authenticated user accessing protected routes - show full layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function RootComponent() {
  return (
    <>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <AuthWrapper />
        <TanStackRouterDevtools position="bottom-right" />
      </ClerkProvider>
    </>
  );
}
