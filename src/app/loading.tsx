import React from "react";
import { LoadingState } from "@/components/ui/FeedbackStates";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <LoadingState message="Loading Pinecrest Academy Portal..." />
    </div>
  );
}
