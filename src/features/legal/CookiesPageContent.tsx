"use client";

import { LegalPageLayout, LegalContent } from "./components";

export default function CookiesPageContent() {
  return (
    <LegalPageLayout translationNamespace="CookiesPage">
      <LegalContent translationNamespace="CookiesPage" sectionsCount={6} />
    </LegalPageLayout>
  );
}
