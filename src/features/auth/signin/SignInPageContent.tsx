"use client";

import { SignInForm } from "./components";
import { AuthLayout } from "../layout";

export default function SignInPageContent() {
  return (
    <AuthLayout translationNamespace="SignInPage">
      <SignInForm showHeader={false} />
    </AuthLayout>
  );
}
