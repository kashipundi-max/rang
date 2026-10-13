"use client";

import { useSignInForm } from "../../hooks/useSignInForm";
import { AuthCard } from "@/features/auth/layout";
import {
  FormHeader,
  EmailField,
  PasswordField,
  RememberForgotRow,
  SubmitButton,
  SignUpLink,
} from "./components";

interface SignInFormProps {
  showHeader?: boolean;
}

export function SignInForm({ showHeader = true }: SignInFormProps) {
  const { register, handleSubmit, errors, submitStatus, watch, setValue } =
    useSignInForm();

  const rememberMeValue = watch("rememberMe");

  const isSubmitDisabled =
    submitStatus === "submitting" || submitStatus === "success";

  return (
    <>
      <AuthCard className="w-full">
        {showHeader && <FormHeader className="mb-7 text-center" />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <EmailField register={register} errors={errors} />

          <PasswordField register={register} errors={errors} />

          <RememberForgotRow
            checked={rememberMeValue || false}
            onCheckedChange={(checked) => setValue("rememberMe", checked)}
          />

          <SubmitButton
            submitStatus={submitStatus}
            isDisabled={isSubmitDisabled}
          />
        </form>
      </AuthCard>

      <SignUpLink />
    </>
  );
}

export default SignInForm;
