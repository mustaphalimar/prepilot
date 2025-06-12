import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { StudyPlan } from "./types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  plan: StudyPlan;
}

export const StudyPlanCard: React.FC<Props> = ({ plan }) => {
  const formatLastUpdated = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleActionClick = (e: React.MouseEvent) => {
    alert("Action menu clicked for plan:");
  };

  return (
    <Link href={`/study-plans/${plan.id}`} className="block h-full">
      <Card className="relative w-full h-full flex flex-col rounded-lg min-h-[180px] max-w-none sm:max-w-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 flex-shrink-0">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="font-semibold text-base leading-tight line-clamp-2">
                {plan.title}
              </CardTitle>
            </div>
          </div>
          <CardAction className=" absolute top-6 right-4 flex-shrink-0 ml-2 z-50">
            <Button
              variant="secondary"
              className=" p-1 h-auto relative bg-transparent hover:bg-white"
              onClick={handleActionClick}
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-1 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm text-secondary-foreground">
              {plan.progress}% Completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${plan.progress}%` }}
            />
          </div>
        </CardContent>

        <CardFooter className="flex-shrink-0 pt-2">
          <p className="text-sm text-gray-600">
            Last updated {formatLastUpdated(plan.updated_at)}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};
