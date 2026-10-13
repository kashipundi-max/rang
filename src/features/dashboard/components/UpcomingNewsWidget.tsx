"use client";

import React, { useEffect, useState } from "react";
import { Chip, Panel, SectionLabel } from "./ui";
import { NEWS_RESTRICTED_MINUTES_EACH_SIDE } from "@/lib/rulebook";

type CalendarEvent = { id: string; eventTime: string; currency: string; title: string };

const WARN_BEFORE_MS = 10 * 60 * 1000;
const WINDOW_MS = NEWS_RESTRICTED_MINUTES_EACH_SIDE * 60 * 1000;

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * "Upcoming high-impact news (next 24h)" for Instant / Funded accounts. Reads the
 * public calendar (never the Forex Factory feed directly) and ticks every second
 * so the trader sees when a restricted window is live or about to open.
 */
export default function UpcomingNewsWidget() {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const from = new Date(Date.now() - WINDOW_MS).toISOString();
        const to = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const res = await fetch(`/api/news-calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
        const data = await res.json();
        if (!cancelled) {
          if (res.ok && data.success) setEvents(data.events || []);
          else setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    load();
    const refresh = window.setInterval(load, 15 * 60 * 1000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(refresh);
      window.clearInterval(tick);
    };
  }, []);

  const upcoming = (events || [])
    .map((event) => ({ ...event, at: new Date(event.eventTime).getTime() }))
    .filter((event) => event.at + WINDOW_MS >= now)
    .sort((a, b) => a.at - b.at);
  const active = upcoming.find((event) => Math.abs(now - event.at) <= WINDOW_MS);
  const soon = !active && upcoming.find((event) => event.at - now > 0 && event.at - now <= WARN_BEFORE_MS + WINDOW_MS);

  return (
    <Panel className="p-6">
      <SectionLabel
        action={
          active ? (
            <Chip tone="danger">Restricted window live</Chip>
          ) : soon ? (
            <Chip tone="danger">Window opens in {formatCountdown(soon.at - WINDOW_MS - now)}</Chip>
          ) : undefined
        }
      >
        Upcoming high-impact news
      </SectionLabel>
      <p className="mt-1 text-[13px] text-text-secondary">
        Next 24 hours · no opening or closing trades on affected instruments {NEWS_RESTRICTED_MINUTES_EACH_SIDE} min
        before to {NEWS_RESTRICTED_MINUTES_EACH_SIDE} min after each release (UTC).
      </p>

      <div className="mt-4">
        {events === null && !failed ? (
          <p className="text-[13px] text-text-muted">Loading calendar…</p>
        ) : failed ? (
          <p className="text-[13px] text-text-muted">Calendar unavailable right now.</p>
        ) : upcoming.length === 0 ? (
          <p className="text-[13px] text-text-muted">No high-impact news in the next 24 hours.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {upcoming.slice(0, 6).map((event) => {
              const live = Math.abs(now - event.at) <= WINDOW_MS;
              const warn = !live && event.at - now <= WARN_BEFORE_MS + WINDOW_MS;
              return (
                <li key={event.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-10 shrink-0 rounded-md bg-white/[0.06] py-0.5 text-center text-xs font-bold text-white">
                      {event.currency}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] text-white">{event.title}</span>
                      <span className="block text-xs text-text-muted">
                        {new Date(event.at).toISOString().slice(11, 16)} UTC
                      </span>
                    </span>
                  </div>
                  <span
                    className={`shrink-0 text-[13px] font-semibold tabular-nums ${
                      live ? "text-rose-400" : warn ? "text-amber-300" : "text-text-secondary"
                    }`}
                  >
                    {live ? "Restricted now" : `in ${formatCountdown(event.at - now)}`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Panel>
  );
}
