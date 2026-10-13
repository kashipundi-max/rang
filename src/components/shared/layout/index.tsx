"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import BogoPromoPopup from "@/components/BogoPromoPopup";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isDashboard = pathname?.includes("/dashboard");
  const isCrm = pathname?.includes("/crm-portal");
  const isAuthPage = pathname?.includes("/auth/");

  // Auth screens render their own standalone chrome (no site header/footer).
  // The BOGO popup shows on the site and the trader dashboard, not on auth or CRM.
  if (isDashboard || isCrm || isAuthPage) {
    return (
      <>
        {children}
        {isDashboard && <BogoPromoPopup />}
      </>
    );
  }

  return (
    <>
      {/* Header Component */}
      <Header />
      {/* Main Content */}
      {children}
      {/* Footer Component */}
      <Footer />
      <BogoPromoPopup />
    </>
  );
};

export default Layout;
