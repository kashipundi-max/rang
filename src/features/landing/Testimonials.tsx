import { useTranslations } from "next-intl";
import { testimonials } from "@/features/home/TestimonialsSection/config/data";
import { cn } from "@/lib/utils";
import { Container, SectionHeading, splitTitle } from "./ui";

type Review = {
  id: string;
  avatar: string;
  name: string;
  role: string;
  content: string;
};

function ReviewCard({ review, className }: { review: Review; className?: string }) {
  return (
    <article
      className={cn(
        "flex flex-col gap-6 rounded-xl border border-(--brand-border-card) bg-(--brand-surface-card) p-8",
        className
      )}
    >
      <p className="text-base leading-6 text-(--brand-text-secondary)">{review.content}</p>
      <div className="flex items-center gap-4">
        <img
          src={review.avatar}
          alt=""
          loading="lazy"
          className="size-[45px] shrink-0 rounded-full object-cover"
        />
        <div className="flex min-w-0 flex-col">
          <p className="text-base leading-6 font-medium text-(--brand-text-primary)">{review.name}</p>
          <p className="truncate text-sm leading-5 text-(--brand-text-muted)">{review.role}</p>
        </div>
      </div>
    </article>
  );
}

function MarqueeRow({ reviews, reverse = false }: { reviews: Review[]; reverse?: boolean }) {
  return (
    <div className="skin-marquee-mask relative w-full overflow-hidden">
      <div
        className="skin-marquee flex w-max items-stretch gap-6"
        style={{ animationDuration: "45s", animationDirection: reverse ? "reverse" : "normal" }}
      >
        {[...reviews, ...reviews].map((review, index) => (
          <div key={`${review.id}-${index}`} aria-hidden={index >= reviews.length} className="flex">
            <ReviewCard review={review} className="w-[300px] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Review wall: staggered three-column masonry on desktop, two marquees on mobile. */
export default function Testimonials() {
  const t = useTranslations("TestimonialsSection");
  const [lead, accent] = splitTitle(t("title"), 2);

  const reviews: Review[] = testimonials.map((item) => ({
    id: item.id,
    avatar: item.avatar,
    name: t(`testimonials.${item.id}.name`),
    role: `${t(`testimonials.${item.id}.role`)} ${t("at")} ${t(`testimonials.${item.id}.company`)}`,
    content: t(`testimonials.${item.id}.content`),
  }));

  const columns = [reviews.filter((_, i) => i % 3 === 0), reviews.filter((_, i) => i % 3 === 1), reviews.filter((_, i) => i % 3 === 2)];
  const half = Math.ceil(reviews.length / 2);

  return (
    <section id="testimonials" className="isolate flex w-full scroll-mt-24 flex-col items-center py-24">
      <Container className="flex flex-col items-center gap-16 sm:gap-20">
        <SectionHeading eyebrow={t("badge")} lead={lead} accent={accent} description={t("description")} />

        <div className="flex w-full flex-col gap-6 overflow-hidden lg:hidden">
          <MarqueeRow reviews={reviews.slice(0, half)} />
          <MarqueeRow reviews={reviews.slice(half)} reverse />
        </div>

        <div className="hidden w-full grid-cols-3 gap-8 lg:grid">
          {columns.map((column, index) => (
            <div key={index} className={cn("flex flex-col gap-8", index !== 1 && "lg:pt-8")}>
              {column.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
