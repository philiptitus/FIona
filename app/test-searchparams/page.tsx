"use client";
export const dynamic = "force-dynamic";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TestSearchParamsPageContent() {
  const params = useSearchParams();
  return (
    <div>
      <h1>Test useSearchParams</h1>
      <div>foo: {params.get("foo")}</div>
    </div>
  );
}

export default function TestSearchParamsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <TestSearchParamsPageContent />
    </Suspense>
  );
} 