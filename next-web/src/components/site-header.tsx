import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { IconSparkles } from "@tabler/icons-react";
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

export function SiteHeader() {
  const theme = useTheme();
  return (
    <header className="flex bg-white dark:bg-background  h-(--header-height) shrink-0 items-center gap-2 border-b  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full justify-between items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="flex  gap-5 items-center">
          <Button
            className=" bg-gradient-to-r from-primary to-primary/70 hover:from-primary/70 hover:to-primary text-white text-sm h-8 font-semibold"
            size="sm"
          >
            <IconSparkles className="w-4 h-4 mr-2" />
            Get Premium
          </Button>

          <button className="rounded-full cursor-pointer opacity-70 hover:opacity-100">
            <Bell size={20} />
          </button>
          <button
            className="rounded-full cursor-pointer opacity-70 hover:opacity-100"
            onClick={() => {
              if (theme.theme === "dark") {
                theme.setTheme("light");
              } else {
                theme.setTheme("dark");
              }
            }}
          >
            {theme.theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
