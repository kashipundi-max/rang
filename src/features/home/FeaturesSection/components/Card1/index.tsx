"use client";

import { useTranslations } from "next-intl";
import CardLayout from "../CardLayout";
import FollowerCard from "./components/FollowerCard";
import { followerKeys } from "./config/followers";

interface Card1Props {
  className?: string;
  title?: string;
  description?: string;
  index?: number;
}

export default function Card1({
  className,
  title,
  description,
  index = 0,
}: Card1Props) {
  const t = useTranslations("FeaturesSection");

  return (
    <CardLayout
      className={className}
      title={title}
      description={description}
      index={index}
    >
      <div className="flex items-start justify-center pt-5 px-4">
        <div
          className="w-full max-w-[440px] rounded-2xl border border-card-border p-3"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-brand-surface) 15%, transparent) 17.5%, transparent 100%)",
          }}
        >
          <div className="flex flex-col gap-2.5">
            {followerKeys.map((follower, idx) => (
              <FollowerCard
                key={idx}
                username={t(follower.nameKey)}
                isHighlighted={follower.isHighlighted}
                index={idx}
                startedFollowingText={t("card1.startedFollowing")}
                viewText={t("card1.view")}
              />
            ))}
          </div>
        </div>
      </div>
    </CardLayout>
  );
}
