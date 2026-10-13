"use client";

import { SignUpForm } from "./components";
import { AuthLayout } from "../layout";

export default function SignUpPageContent() {
  return (
    <AuthLayout translationNamespace="SignUpPage">
      <SignUpForm showHeader={false} />
    </AuthLayout>
  );
}