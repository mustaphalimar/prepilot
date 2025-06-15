"use client";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useScheduleExamSheet } from "../hooks/use-schedule-exam-sheet";

export const ScheduleExamSheet: React.FC = () => {
  const [examDate, setExamDate] = useState<Date | undefined>(new Date());
  const scheduleExamSheet = useScheduleExamSheet();
  const handleScheduleExam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const formData = new FormData(e.currentTarget);
  };

  return (
    <Sheet
      open={scheduleExamSheet.open}
      onOpenChange={scheduleExamSheet.onOpenChange}
    >
      <SheetContent className="md:min-w-xl">
        <SheetHeader className="px-2">
          <SheetTitle className="text-xl font-bold">
            Do you want to schedule an upcoming exam for this subject?
          </SheetTitle>
          <SheetDescription>
            Schedule an upcoming exam for {scheduleExamSheet.subject}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleScheduleExam} className="px-4 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Exam title</Label>
            <Input
              id="title"
              name="title"
              value={`${scheduleExamSheet.subject} Exam`}
              placeholder="Enter plan title"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="subject">Subject of the exam</Label>
            <Input
              id="subject"
              name="subject"
              value={`${scheduleExamSheet.subject}`}
              placeholder="Enter subject"
              required
            />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="exam_date">Exam Date</Label>

              <DatePicker date={examDate} setDate={setExamDate} />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => scheduleExamSheet.onOpenChange(false)}
            >
              No
            </Button>
            <Button type="submit">Yes, Schedule</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
