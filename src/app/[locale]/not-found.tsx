import { ErrorPageContent } from "@/features/error";

export default function NotFound() {
  return <ErrorPageContent errorCode="404" translationKey="NotFoundPage" />;
}
