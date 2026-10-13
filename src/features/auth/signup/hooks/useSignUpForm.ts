"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { createSignUpSchema, type SignUpFormData } from "../config/schema";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function useSignUpForm() {
    const t = useTranslations("SignUpPage.form.validation");
    const locale = useLocale();
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
    const [collaboratorCode, setCollaboratorCode] = useState("");

    // Create schema with translated messages
    const schema = createSignUpSchema({
        nameRequired: t("nameRequired"),
        nameMin: t("nameMin"),
        emailRequired: t("emailRequired"),
        emailInvalid: t("emailInvalid"),
        passwordRequired: t("passwordRequired"),
        passwordMin: t("passwordMin"),
        passwordUppercase: t("passwordUppercase"),
        passwordLowercase: t("passwordLowercase"),
        passwordNumber: t("passwordNumber"),
        passwordSpecial: t("passwordSpecial"),
        termsRequired: t("termsRequired"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        setValue,
    } = useForm<SignUpFormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            terms: false as unknown as true,
            referralCode: "",
        },
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get("ref");
            const collaborator = params.get("collab");
            if (ref) {
                setValue("referralCode", ref);
            }
            if (collaborator) setCollaboratorCode(collaborator);
        }
    }, [setValue]);

    const onSubmit = useCallback(
        async (data: SignUpFormData) => {
            setSubmitStatus("submitting");

            try {
                const response = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        phone: "",
                        country: "United States",
                        referralCode: data.referralCode,
                        collaboratorCode,
                        locale,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Registration failed");
                }

                setSubmitStatus("success");

                // Redirect to dashboard, allowing middleware to handle locale
                setTimeout(() => {
                    window.location.href = result.verificationPage || `/${locale}/auth/verify-email`;
                }, 800);
            } catch (error: any) {
                console.error("Sign up error:", error);
                setSubmitStatus("error");
                
                alert(error.message || "Failed to register. Please try again.");

                setTimeout(() => setSubmitStatus("idle"), 3000);
            }
        },
        [collaboratorCode, locale]
    );

    return {
        register,
        handleSubmit: handleSubmit(onSubmit),
        errors,
        isValid,
        submitStatus,
        watch,
        setValue,
    };
}
