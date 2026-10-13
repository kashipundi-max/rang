"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminFeedbackHost,
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminTableFooter,
  Spinner,
  adminToast,
} from "../AdminUI";
import { IconCalendar, IconRefresh } from "../Icons";
import { NEWS_COVERED_CURRENCIES, NEWS_RESTRICTED_MINUTES_EACH_SIDE } from "@/lib/rulebook";

type CalendarEvent = {
  id: string;
  eventTime: string;
  currency: string;
  title: string;
  impact: string;
  isRestricted: boolean;
  source: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGES = [
  { id: "upcoming", label: "Upcoming", from: () => Date.now() - NEWS_RESTRICTED_MINUTES_EACH_SIDE * 60_000, to: () => Date.now() + 14 * DAY_MS },
  { id: "past", label: "Past 30 days", from: () => Date.now() - 30 * DAY_MS, to: () => Date.now() },
  { id: "all", label: "Last 180 days + upcoming", from: () => Date.now() - 180 * DAY_MS, to: () => Date.now() + 14 * DAY_MS },
] as const;

function formatUtc(iso: string) {
  const date = new Date(iso);
  return `${date.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" })} · ${date.toISOString().slice(11, 16)} UTC`;
}

/**
 * Admin view of the high-impact calendar the News Trading Rule enforces:
 * sync from Forex Factory on demand and include/exclude individual events.
 */
export default function NewsCalendarTab() {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("upcoming");
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [currency, setCurrency] = useState("All");

  const load = useCallback(async () => {
    const selected = RANGES.find((item) => item.id === range)!;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: new Date(selected.from()).toISOString(),
        to: new Date(selected.to()).toISOString(),
        all: "1",
      });
      const res = await fetch(`/api/news-calendar?${params}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not load the calendar.");
      const list: CalendarEvent[] = data.events || [];
      setEvents(range === "upcoming" ? list : [...list].reverse());
    } catch (error: any) {
      setEvents([]);
      adminToast.error(error.message || "Could not load the calendar. Has the news_events migration been run?");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const syncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/news-calendar/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed.");
      if (data.errors?.length && !data.fetchedFeeds) throw new Error(data.errors.join("; "));
      adminToast.success(
        `Synced ${data.fetchedFeeds} feed${data.fetchedFeeds === 1 ? "" : "s"}: ${data.highImpactEvents} high-impact events, ${data.stored} new.`,
      );
      await load();
    } catch (error: any) {
      adminToast.error(error.message || "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const toggle = async (event: CalendarEvent) => {
    setTogglingId(event.id);
    try {
      const res = await fetch("/api/news-calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id, isRestricted: !event.isRestricted }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not update the event.");
      setEvents((current) => (current || []).map((item) => (item.id === event.id ? data.event : item)));
      adminToast.success(
        `${event.currency} "${event.title}" ${data.event.isRestricted ? "is restricted again" : "excluded from the rule"}.`,
      );
    } catch (error: any) {
      adminToast.error(error.message);
    } finally {
      setTogglingId(null);
    }
  };

  const now = Date.now();
  const rows = (events || []).filter((event) => currency === "All" || event.currency === currency);

  return (
    <div className="space-y-5">
      <AdminFeedbackHost />
      <AdminPageHeader
        title="News calendar"
        subtitle={`High-impact events enforced by the News Trading Rule (±${NEWS_RESTRICTED_MINUTES_EACH_SIDE} min, Instant & Funded accounts). Synced from Forex Factory every 6 hours.`}
        onRefresh={load}
        refreshing={loading}
      >
        <AdminButton variant="primary" loading={syncing} onClick={syncNow}>
          {!syncing && <IconRefresh size={14} />}
          {syncing ? "Syncing…" : "Sync now"}
        </AdminButton>
      </AdminPageHeader>

      <AdminPanel flush>
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
            {RANGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRange(item.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  range === item.id ? "bg-white text-black" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
            {["All", ...NEWS_COVERED_CURRENCIES].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  currency === code ? "bg-white/[0.12] text-white" : "text-neutral-500 hover:text-white"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {loading && events === null ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
            <Spinner size={16} /> Loading calendar…
          </div>
        ) : rows.length === 0 ? (
          <AdminEmptyState
            icon={<IconCalendar size={28} />}
            title="No events"
            hint={range === "upcoming" ? "Press “Sync now” to pull this week’s high-impact events." : "Nothing stored for this range."}
          />
        ) : (
          <>
          <AdminTable
            dense
            bordered
            minWidth={760}
            columns={[
              { key: "time", label: "Time (UTC)" },
              { key: "currency", label: "Currency" },
              { key: "event", label: "Event" },
              { key: "state", label: "Status" },
              { key: "rule", label: "Rule", align: "right" },
            ]}
          >
            {rows.map((event) => {
              const at = new Date(event.eventTime).getTime();
              const windowMs = NEWS_RESTRICTED_MINUTES_EACH_SIDE * 60_000;
              const live = Math.abs(now - at) <= windowMs;
              const past = at + windowMs < now;
              return (
                <tr key={event.id} className={event.isRestricted ? "" : "opacity-60"}>
                  <td className="whitespace-nowrap px-3 py-2.5 align-middle text-xs text-white tabular-nums">
                    {formatUtc(event.eventTime)}
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-white">
                      {event.currency}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-middle text-xs text-white">{event.title}</td>
                  <td className="px-3 py-2.5 align-middle">
                    {live ? (
                      <AdminBadge tone="danger">Window live</AdminBadge>
                    ) : past ? (
                      <AdminBadge tone="neutral">Past</AdminBadge>
                    ) : (
                      <AdminBadge tone="info">Upcoming</AdminBadge>
                    )}
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-[11px] ${event.isRestricted ? "text-amber-300" : "text-neutral-500"}`}>
                        {event.isRestricted ? "Restricted" : "Excluded"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={event.isRestricted}
                        aria-label={event.isRestricted ? "Exclude from rule" : "Include in rule"}
                        disabled={togglingId === event.id}
                        onClick={() => toggle(event)}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors disabled:opacity-60 ${
                          event.isRestricted ? "border-amber-400/60 bg-amber-500/40" : "border-white/15 bg-white/[0.08]"
                        }`}
                      >
                        <span
                          className={`absolute flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-black ${
                            event.isRestricted ? "left-[18px]" : "left-[2px]"
                          }`}
                        >
                          {togglingId === event.id && <Spinner size={9} />}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
          <AdminTableFooter shown={rows.length} total={(events || []).length} noun="events" />
          </>
        )}
      </AdminPanel>
    </div>
  );
}
