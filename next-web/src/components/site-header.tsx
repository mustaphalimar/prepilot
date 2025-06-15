import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { IconSparkles } from "@tabler/icons-react";
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { motion } from "motion/react";

export function SiteHeader() {
  const theme = useTheme();
  return (
    <header className="flex bg-white dark:bg-background  h-(--header-height) shrink-0 items-center gap-2 border-b  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full justify-between items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="flex  gap-5 items-center">
          <Button
            className=" bg-gradient-to-r  transition-colors duration-300 from-primary to-primary/70 hover:from-primary/70 hover:to-primary text-white text-sm  font-semibold"
            size="sm"
          >
            <IconSparkles className="w-4 h-4" />
            Upgrade
          </Button>

          <button className="rounded-full cursor-pointer opacity-70 hover:opacity-100">
            <Bell size={20} />
          </button>
          <button
            className="rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-all duration-300  active:scale-95"
            onClick={() => {
              if (theme.theme === "dark") {
                theme.setTheme("light");
              } else {
                theme.setTheme("dark");
              }
            }}
          >
            <div className="relative w-5 h-5">
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: theme.theme === "dark" ? 1 : 0,
                  rotate: theme.theme === "dark" ? 0 : 90,
                  scale: theme.theme === "dark" ? 1 : 0,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                <Sun size={20} />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: theme.theme === "dark" ? 0 : 1,
                  rotate: theme.theme === "dark" ? -90 : 0,
                  scale: theme.theme === "dark" ? 0 : 1,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                <Moon size={20} />
              </motion.div>
            </div>
          </button>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
