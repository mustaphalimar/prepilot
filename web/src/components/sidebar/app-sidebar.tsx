"use client";

import * as React from "react";
import {
  IconBook,
  IconBrain,
  IconBulb,
  IconCalendarEvent,
  IconClipboardCheck,
  IconClockHour4,
  IconFlask,
  IconHelp,
  IconHome,
  IconNote,
  IconProgress,
  IconSettings,
  IconTarget,
  IconTrophy,
  IconUser,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/sidebar/nav-documents";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Student",
    email: "student@example.com",
    avatar: "/avatars/student.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconHome,
    },
    {
      title: "Study Plans",
      url: "#",
      icon: IconCalendarEvent,
    },
    {
      title: "Practice Tests",
      url: "#",
      icon: IconFlask,
    },
    {
      title: "Flashcards",
      url: "#",
      icon: IconBrain,
    },
    {
      title: "Progress",
      url: "#",
      icon: IconProgress,
    },
    {
      title: "Goals",
      url: "#",
      icon: IconTarget,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Help & Support",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Profile",
      url: "#",
      icon: IconUser,
    },
  ],
  documents: [
    {
      name: "Study Materials",
      url: "#",
      icon: IconBook,
    },
    {
      name: "Exam Notes",
      url: "#",
      icon: IconNote,
    },
    {
      name: "Test Results",
      url: "#",
      icon: IconClipboardCheck,
    },
    {
      name: "Study Timer",
      url: "#",
      icon: IconClockHour4,
    },
    {
      name: "Achievements",
      url: "#",
      icon: IconTrophy,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconBulb className="!size-5" />
                <span className="text-base font-semibold">PrePilot</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
