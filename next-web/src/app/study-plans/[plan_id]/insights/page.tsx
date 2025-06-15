"use client";
import { useParams } from "next/navigation";

export default function InsightsPage() {
  const params = useParams();
  const studyPlanId = params.plan_id;

  return (
    <div>
      <h1>Insights for {studyPlanId} </h1>
    </div>
  );
}
