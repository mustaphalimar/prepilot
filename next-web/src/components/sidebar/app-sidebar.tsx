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
  IconSettings,
  IconTarget,
  IconTrophy,
  IconUser,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/sidebar/nav-tracking";
import { NavMain } from "@/components/sidebar/nav-learning";
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
import Link from "next/link";

const data = {
  user: {
    name: "Student",
    email: "student@example.com",
    avatar: "/avatars/student.jpg",
  },
  learning: [
    {
      title: "Study Plans",
      url: "/study-plans",
      icon: IconCalendarEvent,
    },
    {
      title: "Subjects",
      url: "/subjects",
      icon: IconBook,
    },
    {
      title: "Practice Tests",
      url: "/practice-tests",
      icon: IconFlask,
    },
    {
      title: "Flashcards",
      url: "/flashcards",
      icon: IconBrain,
    },
    // {
    //   title: "Exam Notes",
    //   url: "/exam-notes",
    //   icon: IconNote,
    // },
    // {
    //   title: "Progress",
    //   url: "/progress",
    //   icon: IconProgress,
    // },
  ],

  tracking: [
    {
      title: "Exams",
      url: "/exams",
      icon: IconClipboardCheck,
    },
    {
      title: "Goals",
      url: "/goals",
      icon: IconTarget,
    },
    {
      title: "Study Timer",
      url: "/study-timer",
      icon: IconClockHour4,
    },
    {
      title: "Achievements",
      url: "/achievements",
      icon: IconTrophy,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Help & Support",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: IconUser,
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
              <Link href="/">
                <IconBulb className="!size-5" />
                <span className="text-base font-semibold">PrePilot</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.learning} groupName="📘 Learning" />
        <NavDocuments items={data.tracking} groupName="📊 Tracking" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{/* <NavUser /> */}</SidebarFooter>
    </Sidebar>
  );
}
