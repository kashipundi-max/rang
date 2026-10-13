"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createSignInSchema, type SignInFormData } from "../config/schema";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function useSignInForm() {
    const t = useTranslations("SignInPage.form.validation");
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

    // Create schema with translated messages
    const schema = createSignInSchema({
        emailRequired: t("emailRequired"),
        emailInvalid: t("emailInvalid"),
        passwordRequired: t("passwordRequired"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        reset,
        watch,
        setValue,
    } = useForm<SignInFormData>({
        resolver: zodResolver(schema),
        mode: "onBlur",
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = useCallback(
        async (data: SignInFormData) => {
            setSubmitStatus("submitting");

            try {
                const response = await fetch("/api/auth/signin", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: data.email,
                        password: data.password,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Authentication failed");
                }

                setSubmitStatus("success");
                
                // Redirect to dashboard, allowing middleware to handle locale
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 800);
            } catch (error: any) {
                console.error("Sign in error:", error);
                setSubmitStatus("error");

                // Show alert with the actual error message
                alert(error.message || "Failed to sign in. Please check your credentials.");

                setTimeout(() => setSubmitStatus("idle"), 3000);
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
        setValue,
    };
}
