import { Metadata } from "next";
import { CrmSignUpPage } from "@/features/crm-auth";

export const metadata: Metadata = {
  title: "CRM Admin Register - Administrative Gateway",
  description: "Secure administrator account creation for the CRM Portal. Authorized personnel only.",
};

export default function Page() {
  return <CrmSignUpPage />;
}
