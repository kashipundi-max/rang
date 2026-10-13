"use client";

import { LegalPageLayout, LegalContent } from "./components";

export default function PrivacyPageContent() {
  return (
    <LegalPageLayout translationNamespace="PrivacyPage">
      <LegalContent translationNamespace="PrivacyPage" sectionsCount={7} />
    </LegalPageLayout>
  );
}
