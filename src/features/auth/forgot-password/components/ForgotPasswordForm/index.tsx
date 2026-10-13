"use client";

import { useForgotPasswordForm } from "../../hooks/useForgotPasswordForm";
import { AuthCard } from "@/features/auth/layout";
import {
  FormHeader,
  EmailField,
  SubmitButton,
  BackToSignInLink,
} from "./components";

interface ForgotPasswordFormProps {
  showHeader?: boolean;
}

export function ForgotPasswordForm({
  showHeader = true,
}: ForgotPasswordFormProps) {
  const { register, handleSubmit, errors, submitStatus } =
    useForgotPasswordForm();

  const isSubmitDisabled =
    submitStatus === "submitting" || submitStatus === "success";

  return (
    <>
      <AuthCard className="w-full">
        {showHeader && <FormHeader className="mb-7 text-center" />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <EmailField register={register} errors={errors} />

          <SubmitButton
            submitStatus={submitStatus}
            isDisabled={isSubmitDisabled}
          />
        </form>
      </AuthCard>

      <BackToSignInLink />
    </>
  );
}

export default ForgotPasswordForm;
