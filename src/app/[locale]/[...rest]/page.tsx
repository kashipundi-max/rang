import { notFound } from "next/navigation";

// This catch-all route ensures that any unknown routes within the [locale] segment
// will trigger the not-found page (e.g. /en/unknown-route)
export default function CatchAllPage() {
  notFound();
}
