"use client";
import { SignIn, SignUp, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignUp] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className=" flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin-fast rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="text-gray-600">Preparing your study session...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    router.replace("/study-plans");
  }
  return (
    <div className=" flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 py-10">
        <div className="flex flex-col items-center gap-4 justify-center">
          {isSignUp ? (
            <SignUp afterSignUpUrl="/study-plans" redirectUrl="/study-plans" />
          ) : (
            <SignIn afterSignInUrl="/study-plans" redirectUrl="/study-plans" />
          )}
        </div>
      </div>
    </div>
  );
}
