"use client";

import { StudyPlanCard } from "@/features/study-plans/study-plan-card";
import { mockStudyPlans } from "@/features/study-plans/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pin } from "lucide-react";
import { useState } from "react";
import { CreateStudyPlanSheet } from "@/features/study-plans/create-study-plan-sheet";

export default function StudyPlansPage() {
  const [isCreatePlanSheetOpen, setIsCreatePlanSheetOpen] = useState(false);
  return (
    <main className="p-5">
      <h1 className="text-3xl font-bold">Study Plans</h1>

      {/* Search Bar and Create Button */}
      <div className="mt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search study plans..." className="pl-10" />
        </div>
        <CreateStudyPlanSheet
          isCreatePlanSheetOpen={isCreatePlanSheetOpen}
          setIsCreatePlanSheetOpen={setIsCreatePlanSheetOpen}
        />
        {/* <Button className="whitespace-nowrap font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button> */}
      </div>

      {/* Pinned Study Plans Section */}
      <div className="mt-8">
        <div className="flex items-center gap-1">
          <Pin size={20} />
          <h2 className="text-xl font-semibold">Pinned</h2>
        </div>
        {/* <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <p className="text-sm">No pinned study plans yet</p>
            <p className="text-xs text-gray-400">
              Pin your important study plans to see them here
            </p>
          </div>
        </div> */}
      </div>

      {/* All Study Plans Section */}
      <div className="mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockStudyPlans.map((plan) => {
            return <StudyPlanCard key={plan.id} plan={plan} />;
          })}
        </div>
      </div>
    </main>
  );
}
