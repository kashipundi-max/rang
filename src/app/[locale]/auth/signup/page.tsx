import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignUpPageContent } from "@/features/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SignUpPage.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function SignUpPage() {
  return <SignUpPageContent />;
}
