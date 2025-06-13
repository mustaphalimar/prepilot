import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthWrapper } from "@/features/auth/auth-wrapper";
import { DemoPage } from "@/components/demo-page";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Prepilot",
  description: "AI Exam Preparing buddy",
};

const RAILWAY_ENV = process.env.RAILWAY_ENV;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (RAILWAY_ENV === "development") {
    return (
      <html lang="en">
        <body
          className={`${inter.variable} antialiased font-[family-name:var(--font-inter)]`}
        >
          <DemoPage />
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} antialiased font-[family-name:var(--font-inter)] selection:bg-accent  selection:text-accent-foreground `}
        >
          <Providers>
            <AuthWrapper>{children}</AuthWrapper>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
