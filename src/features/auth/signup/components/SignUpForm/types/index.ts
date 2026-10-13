import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
// Re-export the SignUpFormData from schema for consistent typing
export type { SignUpFormData } from "../../../config/schema";
import type { SignUpFormData } from "../../../config/schema";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

export interface SignUpFormContext {
    register: UseFormRegister<SignUpFormData>;
    errors: FieldErrors<SignUpFormData>;
    setValue: UseFormSetValue<SignUpFormData>;
    submitStatus: SubmitStatus;
    isSubmitDisabled: boolean;
}
