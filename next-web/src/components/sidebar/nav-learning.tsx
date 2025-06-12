"use client";

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function NavMain({
  items,
  groupName,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  groupName: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="border border-transparent hover:border-primary  active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <Link href="/">
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className={cn("", {
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground":
                    pathname === "/",
                  "text-black": pathname !== "/",
                })}
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link href={`${item.url}`} key={item.title}>
                <SidebarMenuItem className="cursor-pointer">
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn("", {
                      "bg-primary  text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground":
                        isActive,
                      "text-black": !isActive,
                    })}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
