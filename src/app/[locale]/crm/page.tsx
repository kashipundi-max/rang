"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function OldCrmPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  useEffect(() => {
    router.replace(`/${locale}/crm-portal`);
  }, [locale, router]);

  return null;
}
