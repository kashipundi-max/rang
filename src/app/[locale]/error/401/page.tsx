import { ErrorPageContent } from "@/features/error";

export default function UnauthorizedDemoPage() {
  return <ErrorPageContent errorCode="401" translationKey="UnauthorizedPage" />;
}
