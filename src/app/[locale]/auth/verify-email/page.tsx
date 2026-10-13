import type { Metadata } from "next";
import VerifyEmailPageContent from "@/features/auth/verify-email/VerifyEmailPageContent";

export const metadata: Metadata = {
  title: "Verify email - Range4ex",
  description: "Verify your email address to activate your Range4ex trader profile.",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; email?: string }>;
};

export default async function VerifyEmailPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  return (
    <VerifyEmailPageContent
      locale={locale}
      status={query.status || "pending"}
      email={query.email || ""}
    />
  );
}
