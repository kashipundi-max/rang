"use client";

import { useTranslations } from "next-intl";
import { HeroButtons } from "./HeroButtons";
import { Badge } from "@/components/ui/Badge";

export function HeroContent() {
  const t = useTranslations("HeroSection");

  return (
    <div className="relative z-30 pt-23 sm:pt-24 md:pt-26 lg:pt-28 xl:pt-36 flex flex-col items-center md:items-center justify-start px-6 sm:px-6 text-left md:text-center">
      <div className="relative w-full max-w-4xl">
        {/* Main content */}
        <div
          className="flex flex-col gap-6 sm:gap-6 md:gap-8 items-start md:items-center justify-start w-full"
        >
          <div className="flex flex-col gap-5 sm:gap-4 items-start md:items-center justify-start w-full">
            <div className="flex flex-col gap-5 sm:gap-4 items-start md:items-center justify-start">
              <div className="flex flex-col gap-5 sm:gap-4 items-start md:items-center justify-start">
                <div className="flex flex-col gap-4 sm:gap-2 items-start md:items-center justify-start text-start md:text-center">
                  {/* Badge */}
                  <div>
                    <Badge variant="primary" size="sm">
                      {t("badge")}
                    </Badge>
                  </div>

                  {/* Main Title */}
                  <h1
                    className="text-[35px] sm:text-[35px] md:text-[42px] lg:text-[56px] xl:text-[71px] leading-8 sm:leading-9 md:leading-[46px] lg:leading-[60px] xl:leading-[77px] tracking-[-0.56px] sm:tracking-[-0.64px] md:tracking-[-0.84px] lg:tracking-[-1.12px] xl:tracking-[-1.42px] bg-linear-to-b from-text-primary from-20% to-text-secondary sm:from-text-primary sm:from-30% sm:to-text-secondary to-100% bg-clip-text m-0 font-normal"
                    style={{
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {t("title1")}
                    <br />
                    {t("title2")}
                  </h1>
                </div>
              </div>

              {/* Subtitle */}
              <div
                className="text-[16px] sm:text-[16px] md:text-[18px] lg:text-[20px] leading-6 md:leading-7 lg:leading-[35px] text-start md:text-center w-full max-w-full md:max-w-[600px] lg:max-w-[676px] text-text-primary sm:text-text-body font-normal font-dm-sans"
              >
                {t("description")}
              </div>
            </div>

            {/* Action Buttons */}
            <HeroButtons />

            {/* Trust Badge */}
            <div
              className="text-[12px] sm:text-[12px] md:text-[14px] leading-[18px] sm:leading-[18px] md:leading-5 font-normal text-start md:text-center w-full font-dm-sans mt-3 sm:mt-2"
            >
              <span className="text-text-body sm:text-text-muted">
                {t("trustBadge")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
