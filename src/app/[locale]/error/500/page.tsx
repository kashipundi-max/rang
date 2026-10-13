import { ErrorPageContent } from "@/features/error";

export default function ServerErrorDemoPage() {
  return <ErrorPageContent errorCode="500" translationKey="ServerErrorPage" />;
}
