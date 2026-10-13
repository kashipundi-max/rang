"use client";

import { useCallback, useEffect, useState } from "react";
import { IconBrandMeta } from "@tabler/icons-react";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminPanel,
  AdminTable,
  AdminBadge,
  AdminEmptyState,
  AdminToolbar,
  AdminTableFooter,
  ADMIN_TD,
  ADMIN_TR,
} from "../AdminUI";

type PixelEvent = {
  id: string;
  eventName: string;
  eventId?: string;
  source: "capi" | "pixel";
  status: "sent" | "failed";
  pixelId?: string;
  orderId?: string;
  userId?: string;
  userEmail?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentIds?: string;
  eventSourceUrl?: string;
  error?: string;
  createdAt: string;
};

type Summary = {
  total: number;
  sent: number;
  failed: number;
  purchases: number;
  purchaseValue: number;
};

const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    value || 0,
  );

const when = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PixelEventsTab() {
  const [events, setEvents] = useState<PixelEvent[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/pixel-events", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error || "Unable to load pixel events.");
        return;
      }
      setEvents(result.events || []);
      setSummary(result.summary || null);
    } catch {
      setError("Unable to load pixel events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const eventNames = Array.from(new Set(events.map((e) => e.eventName))).sort();
  const query = search.trim().toLowerCase();
  const searched = events.filter(
    (e) =>
      !query ||
      [e.eventName, e.eventId, e.orderId, e.userEmail, e.contentName].some((v) =>
        String(v || "").toLowerCase().includes(query),
      ),
  );
  const filtered = searched.filter(
    (e) =>
      (eventFilter === "All" || e.eventName === eventFilter) &&
      (statusFilter === "all" || e.status === statusFilter),
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Pixel events"
        subtitle="Every Meta event fired by the site — server-side Conversions API and browser Pixel alike."
        onRefresh={() => void load()}
        refreshing={loading}
      />

      {error && (
        <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
          No pixel events recorded yet. If you expected some, make sure the{" "}
          <code className="rounded bg-black/30 px-1">pixel_events</code> table
          exists in Supabase — run the DDL block added to{" "}
          <code className="rounded bg-black/30 px-1">
            src/lib/supabase_schema.sql
          </code>
          . Events are captured automatically once the table is present.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminStatCard label="Total events" value={summary?.total ?? 0} hint="Pixel and Conversions API combined" />
        <AdminStatCard label="Delivered" value={summary?.sent ?? 0} hint="Accepted by Meta" />
        <AdminStatCard label="Failed" value={summary?.failed ?? 0} hint="Rejected or errored" />
        <AdminStatCard
          label="Purchase value"
          value={money(summary?.purchaseValue ?? 0)}
          hint={`${summary?.purchases ?? 0} purchase events`}
        />
      </div>

      <AdminPanel flush>
        <AdminToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search event, order, email or content"
          filters={[
            { label: "All events", value: "All", count: searched.length },
            ...eventNames.map((name) => ({
              label: name,
              value: name,
              count: searched.filter((e) => e.eventName === name).length,
            })),
          ]}
          filter={eventFilter}
          onFilter={setEventFilter}
          actions={
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Delivery status"
              className="h-10 rounded-lg border border-white/[0.08] bg-black/25 px-3 text-xs text-white outline-none focus:border-white/25"
            >
              <option value="all" className="bg-neutral-950">All statuses</option>
              <option value="sent" className="bg-neutral-950">Delivered</option>
              <option value="failed" className="bg-neutral-950">Failed</option>
            </select>
          }
        />

        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={<IconBrandMeta size={28} />}
            title={loading ? "Loading events…" : "No events found"}
            hint={loading ? undefined : "Try another search or filter."}
          />
        ) : (
          <>
            <AdminTable
              minWidth={1000}
              dense
              bordered
              columns={[
                { key: "event", label: "Event" },
                { key: "status", label: "Status" },
                { key: "source", label: "Source" },
                { key: "order", label: "Order" },
                { key: "value", label: "Value" },
                { key: "content", label: "Content" },
                { key: "when", label: "When" },
              ]}
            >
              {filtered.map((event) => (
                <tr key={event.id} className={ADMIN_TR}>
                  <td className={`max-w-[260px] ${ADMIN_TD}`}>
                    <span className="block text-xs font-medium text-white">{event.eventName}</span>
                    {event.eventId && (
                      <span className="block truncate font-mono text-[11px] text-neutral-500">{event.eventId}</span>
                    )}
                    {event.error && (
                      <span className="mt-0.5 block truncate text-[11px] text-rose-300" title={event.error}>
                        {event.error}
                      </span>
                    )}
                  </td>
                  <td className={ADMIN_TD}>
                    <AdminBadge tone={event.status === "sent" ? "success" : "danger"}>
                      {event.status === "sent" ? "Delivered" : "Failed"}
                    </AdminBadge>
                  </td>
                  <td className={`text-[11px] uppercase text-neutral-400 ${ADMIN_TD}`}>{event.source}</td>
                  <td className={`max-w-[200px] ${ADMIN_TD}`}>
                    {event.orderId ? (
                      <span className="block font-mono text-xs text-white">{event.orderId}</span>
                    ) : (
                      <span className="text-[11px] text-neutral-600">—</span>
                    )}
                    {event.userEmail && (
                      <span className="block truncate text-[11px] text-neutral-500">{event.userEmail}</span>
                    )}
                  </td>
                  <td className={`text-xs text-white tabular-nums ${ADMIN_TD}`}>
                    {event.value != null ? money(event.value, event.currency || "USD") : (
                      <span className="text-[11px] text-neutral-600">—</span>
                    )}
                  </td>
                  <td className={`max-w-[220px] ${ADMIN_TD}`}>
                    <span className="block truncate text-xs text-neutral-300">{event.contentName || "—"}</span>
                    {event.contentIds && (
                      <span className="block truncate font-mono text-[11px] text-neutral-500">{event.contentIds}</span>
                    )}
                  </td>
                  <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                    {when(event.createdAt)}
                  </td>
                </tr>
              ))}
            </AdminTable>
            <AdminTableFooter shown={filtered.length} total={events.length} noun="events" />
          </>
        )}
      </AdminPanel>
    </div>
  );
}
