"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
    createForgotPasswordSchema,
    ForgotPasswordFormData,
} from "../config/schema";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function useForgotPasswordForm() {
    const t = useTranslations("ForgotPasswordPage.form.validation");
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

    const schema = createForgotPasswordSchema(t);

    const {
        register,
        handleSubmit: hookFormSubmit,
        formState: { errors, isValid, isDirty },
        reset,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = useCallback(async (data: ForgotPasswordFormData) => {
        setSubmitStatus("submitting");

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            console.log("Password reset email sent to:", data.email);
            setSubmitStatus("success");

            // Reset form after success
            reset();
        } catch (error) {
            console.error("Password reset error:", error);
            setSubmitStatus("error");

            // Reset error status after delay
            setTimeout(() => setSubmitStatus("idle"), 3000);
        }
    }, [reset]);

    const handleSubmit = hookFormSubmit(onSubmit);

    return {
        register,
        handleSubmit,
        errors,
        isValid,
        isDirty,
        submitStatus,
    };
}
