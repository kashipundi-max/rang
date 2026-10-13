"use client";

import React, { useEffect, useState } from "react";
import {
  AdminButton,
  AdminPageHeader,
  AdminPanel,
  AdminStatCard,
  AdminTable,
  AdminEmptyState,
  AdminModal,
  AdminToolbar,
  AdminTableFooter,
  AdminFeedbackHost,
  adminConfirm,
  adminToast,
  ADMIN_TD,
  ADMIN_TR,
} from "../AdminUI";
import { IconMail } from "../Icons";
import {
  TrustpilotInvitationRecord,
  createTrustpilotInvitation,
  getTrustpilotInvitationHistory,
  isTrustpilotReady,
} from "@/lib/trustpilot";

const EMPTY_FORM = {
  recipientEmail: "",
  recipientName: "",
  referenceId: "",
  tags: "",
  locationId: "",
  templateId: "",
};

const inputClass =
  "h-10 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 text-xs font-medium text-white outline-none transition-colors placeholder:text-neutral-600 hover:border-white/20 focus:border-brand-primary/50";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
        {required && <span className="text-rose-400"> *</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-neutral-600">{hint}</span>}
    </label>
  );
}

const when = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

export default function TrustpilotInvitesTab() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [ready, setReady] = useState(false);
  const [history, setHistory] = useState<TrustpilotInvitationRecord[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setHistory(getTrustpilotInvitationHistory());
    // The Trustpilot snippet runs from <head>, but check until it is available.
    if (isTrustpilotReady()) {
      setReady(true);
      return;
    }
    const interval = window.setInterval(() => {
      if (isTrustpilotReady()) {
        setReady(true);
        window.clearInterval(interval);
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, []);

  const update = (key: keyof typeof EMPTY_FORM) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const recipientEmail = form.recipientEmail.trim();
    const recipientName = form.recipientName.trim();
    const referenceId = form.referenceId.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setMessage({ type: "error", text: "Enter a valid recipient email." });
      return;
    }
    if (!recipientName || !referenceId) {
      setMessage({ type: "error", text: "Recipient name and reference ID are required." });
      return;
    }

    if (
      history.some((item) => item.referenceId === referenceId) &&
      !(await adminConfirm({
        title: "Send again?",
        message: `An invitation with reference "${referenceId}" was already sent from this browser.`,
        confirmLabel: "Send again",
      }))
    )
      return;

    try {
      createTrustpilotInvitation({
        recipientEmail,
        recipientName,
        referenceId,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        locationId: form.locationId.trim() || undefined,
        templateId: form.templateId.trim() || undefined,
      });
      setHistory(getTrustpilotInvitationHistory());
      adminToast.success(`Invitation queued for ${recipientEmail}.`);
      setShowForm(false);
      // Keep tags / location / template so a batch with the same settings is quick.
      setForm((prev) => ({ ...prev, recipientEmail: "", recipientName: "", referenceId: "" }));
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Could not send the invitation." });
    }
  };

  const query = search.trim().toLowerCase();
  const rows = history.filter(
    (item) =>
      !query ||
      [item.recipientEmail, item.recipientName, item.referenceId].some((v) =>
        String(v || "").toLowerCase().includes(query),
      ),
  );
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-5">
      <AdminFeedbackHost />
      <AdminPageHeader
        title="Trustpilot invitations"
        subtitle="Send a Trustpilot review invitation to any customer. Trustpilot emails the recipient using your invitation settings."
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminStatCard label="Connection" value={ready ? "Connected" : "Loading…"} hint="Trustpilot script status" />
        <AdminStatCard label="Sent" value={history.length} hint="From this browser" />
        <AdminStatCard
          label="This week"
          value={history.filter((item) => new Date(item.sentAt).getTime() >= weekAgo).length}
          hint="Last 7 days"
        />
        <AdminStatCard
          label="Unique customers"
          value={new Set(history.map((item) => item.recipientEmail)).size}
          hint="Distinct emails"
        />
      </div>

      <AdminPanel flush>
        <AdminToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search email, name or reference"
          actions={
            <AdminButton
              variant="primary"
              disabled={!ready}
              onClick={() => {
                setMessage(null);
                setShowForm(true);
              }}
            >
              <IconMail size={14} />
              New invitation
            </AdminButton>
          }
        />
        {rows.length === 0 ? (
          <AdminEmptyState
            icon={<IconMail size={28} />}
            title="No invitations"
            hint={
              history.length === 0
                ? "Invitations sent from this browser appear here. Trustpilot's dashboard has the full history."
                : "Try another search."
            }
          />
        ) : (
          <>
            <AdminTable
              minWidth={760}
              dense
              bordered
              columns={[
                { key: "recipient", label: "Recipient" },
                { key: "reference", label: "Reference" },
                { key: "template", label: "Template" },
                { key: "tags", label: "Tags" },
                { key: "sent", label: "Sent" },
              ]}
            >
              {rows.map((item) => (
                <tr key={`${item.referenceId}-${item.sentAt}`} className={ADMIN_TR}>
                  <td className={`max-w-[240px] ${ADMIN_TD}`}>
                    <span className="block truncate text-xs font-medium text-white">{item.recipientName}</span>
                    <span className="block truncate text-[11px] text-neutral-500">{item.recipientEmail}</span>
                  </td>
                  <td className={`font-mono text-xs text-white ${ADMIN_TD}`}>{item.referenceId}</td>
                  <td className={`max-w-[200px] truncate text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                    {item.templateId || "Default"}
                  </td>
                  <td className={`max-w-[200px] truncate text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                    {(item.tags || []).join(", ") || "—"}
                  </td>
                  <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>{when(item.sentAt)}</td>
                </tr>
              ))}
            </AdminTable>
            <AdminTableFooter shown={rows.length} total={history.length} noun="invitations" />
          </>
        )}
      </AdminPanel>

      <AdminModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New invitation"
        subtitle="Fields marked * are required."
        footer={
          <>
            <AdminButton onClick={() => setShowForm(false)}>Cancel</AdminButton>
            <AdminButton type="submit" form="trustpilot-form" variant="primary" disabled={!ready}>
              <IconMail size={14} />
              Send invitation
            </AdminButton>
          </>
        }
      >
        <form id="trustpilot-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Recipient email" required>
              <input
                type="email"
                value={form.recipientEmail}
                onChange={update("recipientEmail")}
                placeholder="john@gmail.com"
                className={inputClass}
              />
            </Field>
            <Field label="Recipient name" required>
              <input
                value={form.recipientName}
                onChange={update("recipientName")}
                placeholder="John"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Reference ID" required hint="Order ID or any unique reference.">
            <input
              value={form.referenceId}
              onChange={update("referenceId")}
              placeholder="Order_123"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Tags" hint="Comma separated.">
              <input value={form.tags} onChange={update("tags")} placeholder="tag_1, tag_2" className={inputClass} />
            </Field>
            <Field label="Location ID">
              <input value={form.locationId} onChange={update("locationId")} placeholder="location_1" className={inputClass} />
            </Field>
            <Field label="Template ID" hint="Empty = default.">
              <input value={form.templateId} onChange={update("templateId")} placeholder="Template GUID" className={inputClass} />
            </Field>
          </div>

          {message && message.type === "error" && (
            <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
              {message.text}
            </p>
          )}
        </form>
      </AdminModal>
    </div>
  );
}
