"use client";

import { LegalPageLayout, LegalContent } from "./components";

export default function TermsPageContent() {
  return (
    <LegalPageLayout translationNamespace="TermsPage">
      <LegalContent translationNamespace="TermsPage" sectionsCount={7} />
    </LegalPageLayout>
  );
}
