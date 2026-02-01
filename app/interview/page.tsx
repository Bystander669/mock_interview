"use client";

import { Suspense } from "react";
import InterviewContent from "./InterviewContent";

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center mt-10 text-white">
          Loading interview questions...
        </div>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}
