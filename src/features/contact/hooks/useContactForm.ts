"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createContactSchema, type ContactFormData } from "../config/schema";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function useContactForm() {
  const t = useTranslations("ContactSection.form");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  // Create schema with translated messages
  const schema = createContactSchema({
    nameRequired: t("validation.nameRequired"),
    nameMin: t("validation.nameMin"),
    nameMax: t("validation.nameMax"),
    emailRequired: t("validation.emailRequired"),
    emailInvalid: t("validation.emailInvalid"),
    subjectRequired: t("validation.subjectRequired"),
    subjectMin: t("validation.subjectMin"),
    subjectMax: t("validation.subjectMax"),
    messageRequired: t("validation.messageRequired"),
    messageMin: t("validation.messageMin"),
    messageMax: t("validation.messageMax"),
    phoneInvalid: t("validation.phoneInvalid"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      setSubmitStatus("submitting");

      try {
        // Simulate API call - replace with actual endpoint
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Log form data (replace with actual API call)
        console.log("Form submitted:", data);

        setSubmitStatus("success");
        reset();

        // Reset status after showing success message
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } catch (error) {
        console.error("Form submission error:", error);
        setSubmitStatus("error");

        // Reset status after showing error message
        setTimeout(() => setSubmitStatus("idle"), 5000);
      }
    },
    [reset]
  );

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isValid,
    isDirty,
    submitStatus,
    watch,
    reset,
  };
}
