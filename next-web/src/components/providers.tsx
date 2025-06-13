"use client";
import { ProgressProvider } from "@bprogress/next/app";

import { ThemeProvider as NextThemesProvider } from "next-themes";

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

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
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ProgressProvider>
  );
};
