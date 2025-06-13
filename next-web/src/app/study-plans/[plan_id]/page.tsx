"use client";
import { mockStudyPlans } from "@/features/study-plans/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  IconCalendar,
  IconClock,
  IconTrophy,
  IconBookmark,
  IconTarget,
  IconEdit,
  IconTrash,
  IconPlaylistAdd,
  IconChartPie,
} from "@tabler/icons-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { AssistantPanel } from "@/features/study-plans/assistant-panel";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Bot } from "lucide-react";

interface Props {
  params: {
    plan_id: string;
  };
}

const StudyPlanPage: React.FC<Props> = ({ params }) => {
  const plan = mockStudyPlans.find((plan) => plan.id === params.plan_id);
  const [isAssistantPanelOpen, setIsAssistantPanelOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!plan) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const examDate = new Date(plan.exam_date);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const progressPercentage = plan.progress;

  return (
    <div className="flex gap-6 px-6 py-8">
      {/* Header Section */}
      <div
        className={cn("w-full", {
          "w-[68%]": isAssistantPanelOpen,
        })}
      >
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {plan.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{plan.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <IconBookmark className="w-4 h-4" />
                  <span>{plan.subject}</span>
                </div>
                <div className="flex items-center gap-1">
                  <IconCalendar className="w-4 h-4" />
                  <span>Created {formatDate(plan.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <IconEdit className="w-4 h-4 mr-2" />
                Edit Plan
              </Button>
              <Button variant="outline" size="sm">
                <IconTrash className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <div
                className={cn({
                  "hidden opacity-0": isAssistantPanelOpen,
                })}
              >
                <motion.div
                  className=""
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  // whileHover={{ scale: 1.05 }}
                  // whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="relative overflow-hidden flex items-center"
                    onClick={() => setIsAssistantPanelOpen(true)}
                    size="sm"
                  >
                    <Bot size={24} className="z-10 size-5" />
                    <motion.span
                      className="ml-0 whitespace-nowrap font-medium"
                      initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                      animate={{
                        width: isHovered ? "auto" : 0,
                        opacity: isHovered ? 1 : 0,
                        marginLeft: isHovered ? 2 : -6,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeInOut",
                      }}
                    >
                      Assistant
                    </motion.span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <IconChartPie className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {progressPercentage}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Days Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <IconClock className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{daysRemaining}</div>
                  <div className="text-sm text-gray-500">until exam</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Exam Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <IconTarget className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-lg font-bold">
                    {formatDate(plan.exam_date)}
                  </div>
                  <div className="text-sm text-gray-500">Target date</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Study Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <IconCalendar className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-sm font-bold">
                    {Math.ceil(
                      (plan.end_date.getTime() - plan.start_date.getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </div>
                  <div className="text-sm text-gray-500">total duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline & Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCalendar className="w-5 h-5" />
                  Study Timeline
                </CardTitle>
                <CardDescription>
                  Your study plan schedule and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Timeline Item */}
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">Study Plan Started</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(plan.start_date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Begin comprehensive study program
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">Current Progress</h4>
                        <span className="text-sm text-gray-500">Today</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {progressPercentage}% of study plan completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">Final Review Period</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(plan.end_date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Complete final preparations and review
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">Exam Day</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(plan.exam_date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Take the {plan.subject} examination
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Quick Links */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconPlaylistAdd className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/study-timer">
                    <IconClock className="w-4 h-4 mr-2" />
                    Start Study Session
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/flashcards">
                    <IconBookmark className="w-4 h-4 mr-2" />
                    Review Flashcards
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/practice-tests">
                    <IconTrophy className="w-4 h-4 mr-2" />
                    Take Practice Test
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/progress">
                    <IconChartPie className="w-4 h-4 mr-2" />
                    View Detailed Progress
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Total Study Days
                    </span>
                    <span className="font-medium">
                      {Math.ceil(
                        (plan.end_date.getTime() - plan.start_date.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Days Completed
                    </span>
                    <span className="font-medium">
                      {Math.floor(
                        (Math.ceil(
                          (plan.end_date.getTime() -
                            plan.start_date.getTime()) /
                            (1000 * 60 * 60 * 24),
                        ) *
                          progressPercentage) /
                          100,
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-medium text-green-600">
                      {progressPercentage > 80
                        ? "Excellent"
                        : progressPercentage > 60
                          ? "Good"
                          : "Needs Focus"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div
        className={cn("fixed bottom-8 right-8 bg-white h-[89vh]", {
          "w-[30%] border rounded-xl ": isAssistantPanelOpen,
        })}
      >
        <AssistantPanel
          isOpen={isAssistantPanelOpen}
          setIsOpen={setIsAssistantPanelOpen}
        />
      </div>
    </div>
  );
};

export default StudyPlanPage;
