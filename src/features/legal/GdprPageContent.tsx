"use client";

import { LegalPageLayout, LegalContent } from "./components";

export default function GdprPageContent() {
  return (
    <LegalPageLayout translationNamespace="GdprPage">
      <LegalContent translationNamespace="GdprPage" sectionsCount={7} />
    </LegalPageLayout>
  );
}
