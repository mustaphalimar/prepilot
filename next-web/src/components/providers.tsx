"use client";
import NextNProgressClient from "@/components/progress-bar";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <NextNProgressClient />
      {children}
    </>
  );
};
