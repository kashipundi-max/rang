"use client";

import React, { useEffect, useRef, useState } from "react";
import { IconClock } from "./Icons";
import { getStatisticsNextRefreshAt, getStatisticsSyncMeta } from "@/lib/statisticsSync";

// Never ask the server again sooner than this, even if the countdown is still
// overdue after a refresh (e.g. the upstream call is backing off).
const MIN_TRIGGER_GAP_MS = 60 * 1000;

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatClock(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface StatsSyncTimerProps {
  account: {
    externalStatisticsId?: string;
    statisticsUpdatedAt?: string;
    statisticsPayload?: any;
  };
  onRefreshDue: () => void | Promise<void>;
}

/**
 * Counts down to the next ShowMyTrades sync. Stats are served from Supabase in
 * between; when the countdown ends the dashboard reloads and the server fetches
 * fresh statistics once.
 */
export default function StatsSyncTimer({ account, onRefreshDue }: StatsSyncTimerProps) {
  const nextRefreshAt = getStatisticsNextRefreshAt(account);
  const [now, setNow] = useState(() => Date.now());
  const lastTriggerRef = useRef(0);
  const onRefreshDueRef = useRef(onRefreshDue);
  onRefreshDueRef.current = onRefreshDue;

  useEffect(() => {
    if (nextRefreshAt === null) return;

    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (document.visibilityState !== "visible") return;
      if (current < nextRefreshAt) return;
      if (current - lastTriggerRef.current < MIN_TRIGGER_GAP_MS) return;
      lastTriggerRef.current = current;
      void onRefreshDueRef.current();
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [nextRefreshAt]);

  if (nextRefreshAt === null) return null;

  const remaining = nextRefreshAt - now;
  const syncMeta = getStatisticsSyncMeta(account.statisticsPayload);
  const lastSynced = formatClock(account.statisticsUpdatedAt);
  const retrying = Boolean(syncMeta.lastError);

  return (
    <div
      className={`px-3 py-1.5 rounded border text-xs flex items-center gap-1.5 font-mono ${
        retrying
          ? "bg-amber-500/10 border-amber-500/25 text-amber-200"
          : "bg-neutral-800/60 border-neutral-700 text-neutral-300"
      }`}
      title={
        retrying
          ? `Last update attempt failed: ${syncMeta.lastError}`
          : lastSynced
            ? `Dashboard last updated at ${lastSynced}`
            : undefined
      }
    >
      <IconClock size={14} />
      <span>
        {remaining > 0
          ? `${retrying ? "Retrying update" : "Dashboard update"} in ${formatRemaining(remaining)}`
          : "Updating dashboard…"}
      </span>
    </div>
  );
}
