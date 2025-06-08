import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isSignUp] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin-fast rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="text-gray-600">Preparing your study session...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? "Start Your Exam Prep Journey" : "Welcome Back, Student!"}
          </h2>
          <p className="text-center text-gray-600 mt-2">
            {isSignUp ? "Create your account to begin studying" : "Sign in to continue your study progress"}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 justify-center">
          {isSignUp ? (
            <SignUp afterSignUpUrl="/dashboard" redirectUrl="/dashboard" />
          ) : (
            <SignIn afterSignInUrl="/dashboard" redirectUrl="/dashboard" />
          )}
        </div>
      </div>
    </div>
  );
}
