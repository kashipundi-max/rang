"use client";

import SectionHeader from "./SectionHeader";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  badge: string;
  title: string;
  description: string;
  breadcrumbItems: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({
  badge,
  title,
  description,
  breadcrumbItems,
  className = "",
}: PageHeaderProps) {
  return (
    <section className={cn("relative pt-24 sm:pt-32 pb-8 sm:pb-12", className)}>
      <div className="container relative mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] px-4 sm:px-6  ">
        {/* Breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Section Header */}
        <SectionHeader
          className="dash-card min-h-[280px] py-12!"
          badge={badge}
          useAnimatedBackground
          enableTopFade={false}
          enableBottomFade={false}
          enableSvgBackground={true}
          title={title}
          description={description}
          headingLevel="h1"
        />
      </div>
    </section>
  );
}

export default PageHeader;
