import { ErrorPageContent } from "@/features/error";

export default function NotFoundDemoPage() {
  return <ErrorPageContent errorCode="404" translationKey="NotFoundPage" />;
}
