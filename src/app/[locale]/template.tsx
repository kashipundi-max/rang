import { MetaPixel } from "@/components/analytics/MetaPixel";

export default function LocaleTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MetaPixel />
      {children}
    </>
  );
}
