import { Metadata } from "next";
import { CrmSignInPage } from "@/features/crm-auth";

export const metadata: Metadata = {
  title: "CRM Admin Login - Administrative Gateway",
  description: "Secure administrative login to the CRM Portal. Authorized personnel only.",
};

export default function Page() {
  return <CrmSignInPage />;
}
