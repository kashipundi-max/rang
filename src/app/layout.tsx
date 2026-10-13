import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Range4ex | Trader Development and Skills Evaluations",
  description:
    "Build trading discipline through Range4ex simulated challenges, trader development programs, and structured skills assessments.",
  icons: {
    icon: [{ url: "/favicon-32.png", type: "image/png", sizes: "32x32" }],
    shortcut: "/favicon-32.png",
    apple: "/logo-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
