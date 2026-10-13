"use client";

import { useEffect } from "react";
import { ErrorPageContent } from "@/features/error";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorPageContent errorCode="500" translationKey="ServerErrorPage" />;
}
