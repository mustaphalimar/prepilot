import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Prepilot
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your gateway to productivity
        </p>
      </div>

      <SignedOut>
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-600">
            Please sign in to access your dashboard
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
            You're signed in! Ready to get started?
          </p>
          <div className="flex space-x-4 items-center">
            <Link
              to="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
