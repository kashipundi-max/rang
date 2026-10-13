import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Video | Lunar Range4ex Workspace",
  description: "Watch the featured Lunar Range4ex Workspace video.",
};

export default async function VideoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-bg-primary text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">
            Featured Video
          </p>
          <h1 className="font-clash-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Lunar Range4ex Workspace
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
            Watch the latest platform overview in a clean, full-width viewing page.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/40">
          <div className="relative h-0 overflow-hidden pb-[56.25%]">
            <iframe
              src="https://geo.dailymotion.com/player.html?video=xalbn2i"
              title="Dailymotion Video Player"
              allow="web-share"
              allowFullScreen
              className="absolute left-0 top-0 h-full w-full border-0"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
