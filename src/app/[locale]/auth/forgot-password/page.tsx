import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordPageContent } from "@/features/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "ForgotPasswordPage.meta",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}
