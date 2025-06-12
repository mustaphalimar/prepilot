"use client";
import { ProgressProvider } from "@bprogress/next/app";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ProgressProvider
      height="4px"
      color="#21a181"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};
