import { Button, buttonVariants } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/clerk-react";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isSignedIn } = useAuth();

  const navigate = useNavigate();
  if (isSignedIn) {
    navigate({ to: "/study-plans" });
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Prepilot
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your AI-powered exam preparation companion
        </p>
      </div>

      <SignedOut>
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-600">
            Please sign in to start your exam preparation journey
          </p>
          <SignInButton mode="modal">
            <Button size="lg">Sign In</Button>
          </SignInButton>
          <Link to="/auth" className=" underline">
            Or go to full sign in page
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-600">
            You're signed in! Ready to ace your exams?
          </p>
          <div className="flex space-x-4 items-center">
            <Link to="/dashboard" className={buttonVariants()}>
              Start Studying
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
