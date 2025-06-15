import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockStudyPlans } from "@/features/study-plans/types";
import {
  IconBookmark,
  IconCalendar,
  IconChartPie,
  IconClock,
  IconEdit,
  IconPlaylistAdd,
  IconTarget,
  IconTrash,
  IconTrophy,
} from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Progress } from "@/components/ui/progress";
import { UploadedMaterial } from "@/features/study-plans/uploaded-material";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{
    plan_id: string;
  }>;
}

const StudyPlanPage: React.FC<Props> = async ({ params }) => {
  const { plan_id } = await params;
  const plan = mockStudyPlans.find((plan) => plan.id === plan_id);
  // const [isAssistantPanelOpen] = useState(false);
  // const [isHovered, setIsHovered] = useState(false);

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

  // const toggleUploadState = () => {
  //   setHasUploadedFiles(!hasUploadedFiles);
  // };

  return (
    <div className="flex gap-6 px-6 py-8">
      {/* Header Section */}
      <div
        className={cn(
          "w-full",
          //   {
          //   "w-[68%]": isAssistantPanelOpen && !sidebar.open,
          //   "w-[62%]": sidebar.open && isAssistantPanelOpen,
          // }
        )}
      >
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">
                {plan.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4 dark:text-gray-300">
                {plan.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-200">
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
              {/* <div
                className={cn({
                  "hidden opacity-0": isAssistantPanelOpen,
                })}
              >
                <Button
                  className="relative overflow-hidden flex items-center"
                  onClick={() => setIsAssistantPanelOpen(true)}
                  size="sm"
                >
                  <Bot size={24} className="z-10 size-5" />
                  Assistant
                </Button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-lg gap-3">
                <IconChartPie className="w-8 h-8  text-primary dark:text-blue-300" />
                <div className="w-full">
                  <div className="text-2xl font-bold">
                    {progressPercentage}%
                  </div>
                  <Progress value={progressPercentage} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium ">
                Days Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-lg gap-3">
                <IconClock className="w-8 h-8 text-orange-400 dark:text-orange-300" />
                <div>
                  <div className="text-2xl font-bold">{daysRemaining}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    until exam
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium ">Exam Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <IconTarget className="w-8 h-8 text-green-400 dark:text-green-300" />
                <div>
                  <div className="text-lg font-bold">
                    {formatDate(plan.exam_date)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Target date
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium ">
                Study Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <IconCalendar className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                <div>
                  <div className="text-sm font-bold">
                    {Math.ceil(
                      (plan.end_date.getTime() - plan.start_date.getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    total duration
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-3">
          <div className="col-span-2 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Timeline & Schedule */}
              <div className="lg:col-span-3">
                <UploadedMaterial />
              </div>
            </div>
          </div>
          <div className=" col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconPlaylistAdd className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href={`/study-plans/${plan_id}/insights`}>
                    <IconClock className="w-4 h-4 mr-2" />
                    View insights
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
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Main Content Grid */}
      </div>
      {/* <div
        className={cn(
          "fixed bottom-5 right-5 bg-white dark:bg-background h-[89vh]",
          {
            "lg:w-[30%] xl:w-[30%] border rounded-xl overflow-hidden ":
              isAssistantPanelOpen,
          },
        )}
      >
        <AssistantPanel
          isOpen={isAssistantPanelOpen}
          setIsOpen={setIsAssistantPanelOpen}
        />
      </div> */}
    </div>
  );
};

export default StudyPlanPage;
