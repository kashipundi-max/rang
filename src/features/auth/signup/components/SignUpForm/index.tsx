"use client";

import { useSignUpForm } from "../../hooks/useSignUpForm";
import { AuthCard } from "@/features/auth/layout";
import {
  FormHeader,
  NameField,
  EmailField,
  PasswordFields,
  ReferralCodeField,
  TermsCheckbox,
  SubmitButton,
  SignInLink,
} from "./components";

interface SignUpFormProps {
  showHeader?: boolean;
  hideHeaderOnDesktop?: boolean;
}

export function SignUpForm({
  showHeader = true,
  hideHeaderOnDesktop = false,
}: SignUpFormProps) {
  const { register, handleSubmit, errors, isValid, submitStatus, watch, setValue } =
    useSignUpForm();

  const termsValue = watch("terms");

  const isSubmitDisabled =
    submitStatus === "submitting" || submitStatus === "success" || !isValid;

  return (
    <>
      <AuthCard className="w-full">
        {showHeader && (
          <FormHeader
            className={`mb-7 text-center ${
              hideHeaderOnDesktop ? "lg:hidden" : ""
            }`}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <NameField register={register} errors={errors} />
          <EmailField register={register} errors={errors} />
          <PasswordFields register={register} errors={errors} />
          <ReferralCodeField register={register} errors={errors} />

          <TermsCheckbox
            checked={termsValue}
            onCheckedChange={(checked) =>
              setValue("terms", checked as unknown as true, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            error={errors.terms}
          />

          <SubmitButton
            submitStatus={submitStatus}
            isDisabled={isSubmitDisabled}
          />
        </form>
      </AuthCard>

      <SignInLink />
    </>
  );
}

export * from "./types";
