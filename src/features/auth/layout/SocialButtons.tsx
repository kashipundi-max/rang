"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  IconBrandGoogle,
  IconBrandGithub,
  IconBrandX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface SocialButtonsProps {
  delay?: number;
  /** Translation namespace (e.g., "SignUpPage", "LoginPage") */
  translationNamespace?: string;
}

export function SocialButtons({
  delay = 0.4,
  translationNamespace = "SignUpPage",
}: SocialButtonsProps) {
  const t = useTranslations(`${translationNamespace}.social`);

  const socialProviders = [
    {
      id: "google",
      icon: IconBrandGoogle,
      label: t("google"),
    },
    {
      id: "github",
      icon: IconBrandGithub,
      label: t("github"),
    },
    {
      id: "twitter",
      icon: IconBrandX,
      label: t("twitter"),
    },
  ] as const;

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-3"
    >
      {socialProviders.map(({ id, icon: Icon, label }) => (
        <Button
          key={id}
          variant="outline"
          size="xl"
          className="w-full h-12 rounded-xl font-dm-sans"
          onClick={() => handleSocialLogin(id)}
        >
          <Icon className="w-5 h-5 me-2" />
          {label}
        </Button>
      ))}
    </motion.div>
  );
}
