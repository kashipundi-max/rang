"use client";

import { ForgotPasswordForm } from "./components";
import { AuthLayout } from "../layout";

export default function ForgotPasswordPageContent() {
  return (
    <AuthLayout translationNamespace="ForgotPasswordPage">
      <ForgotPasswordForm showHeader={false} />
    </AuthLayout>
  );
}
