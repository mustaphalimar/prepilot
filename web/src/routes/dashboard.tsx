import { createFileRoute } from "@tanstack/react-router";
import { useUser, useAuth } from "@clerk/clerk-react";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  if (!authLoaded || !userLoaded) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Debug info - this should never show for unauthenticated users
  if (!isSignedIn) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>ERROR:</strong> Dashboard accessed without authentication!
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-3xl font-bold">
              Welcome to your Dashboard, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
            </h1>
            <p className="text-gray-600 mt-2">
              You are successfully authenticated and can access the protected dashboard.
            </p>
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <p className="text-green-700">
                <strong>✓ Authentication Status:</strong> Signed in successfully
              </p>
              <p className="text-green-700 text-sm mt-1">
                User ID: {user?.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
