import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

// The rulebook now lives in the Range4ex Help Center. Keep the /rules path working
// by sending visitors straight there.
export default async function RulesPage({ params }: Props) {
  await params;
  redirect("https://help.range4ex.com");
}
