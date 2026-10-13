"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconCode,
  IconDeviceFloppy,
  IconEye,
  IconPlus,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import { AdminPageHeader, AdminButton } from "../AdminUI";
import type { PromotionTemplatePreset } from "@/lib/promotionTemplatePresets";

type PromotionTemplate = {
  id: string;
  name: string;
  subject: string;
  html: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

const STARTER_HTML = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#0b0a0e;font-family:Arial,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0a0e;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#15131b;border:1px solid #302a3b;border-radius:18px;">
            <tr>
              <td style="padding:36px;">
                <p style="margin:0 0 12px;color:#a879ff;font-size:12px;font-weight:700;letter-spacing:.12em;">RANGE4EX PROMOTION</p>
                <h1 style="margin:0 0 16px;font-size:30px;line-height:1.2;">A new offer for your next challenge</h1>
                <p style="margin:0 0 24px;color:#c8c2d0;font-size:16px;line-height:1.6;">Add your promotional message here. This email is being sent to {{email}}.</p>
                <a href="https://range4ex.com" style="display:inline-block;padding:13px 22px;border-radius:10px;background:#a879ff;color:#0b0a0e;font-weight:700;text-decoration:none;">View offer</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

function parseRecipientInput(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\s,;]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function PromotionManager({ users = [] }: { users?: any[] }) {
  const [templates, setTemplates] = useState<PromotionTemplate[]>([]);
  const [presets, setPresets] = useState<PromotionTemplatePreset[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("New Promotion");
  const [subject, setSubject] = useState("A special offer from Range4ex");
  const [html, setHtml] = useState(STARTER_HTML);
  const [recipientInput, setRecipientInput] = useState("");
  const [availableAccountSizes, setAvailableAccountSizes] = useState<number[]>([]);
  const [selectedAccountSizes, setSelectedAccountSizes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(true);
  
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const recipients = useMemo(
    () => parseRecipientInput(recipientInput),
    [recipientInput],
  );
  const validRecipients = recipients.filter(isEmail);
  const invalidRecipients = recipients.filter((email) => !isEmail(email));

  const filteredUsers = useMemo(() => {
    const query = userSearchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(query) ||
        (u.email || "").toLowerCase().includes(query),
    );
  }, [users, userSearchQuery]);

  const toggleEmail = (email: string) => {
    const emailLower = email.trim().toLowerCase();
    if (!emailLower) return;
    const parsed = parseRecipientInput(recipientInput);
    if (parsed.includes(emailLower)) {
      const updated = parsed.filter((e) => e !== emailLower);
      setRecipientInput(updated.join(", "));
    } else {
      const updated = [...parsed, emailLower];
      setRecipientInput(updated.join(", "));
    }
  };

  const addAllEmails = () => {
    const allEmails = users
      .map((u) => (u.email || "").trim().toLowerCase())
      .filter(Boolean);
    const unique = Array.from(
      new Set([...parseRecipientInput(recipientInput), ...allEmails]),
    );
    setRecipientInput(unique.join(", "));
  };

  const clearAllEmails = () => {
    setRecipientInput("");
  };

  const toggleAccountSize = (size: number) => {
    setSelectedAccountSizes((current) => {
      if (current.includes(size)) return current.filter((value) => value !== size);
      if (current.length >= 3) {
        setError("Choose up to three account sizes for a promotion.");
        return current;
      }
      setError("");
      return [...current, size].sort((a, b) => a - b);
    });
  };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedAccountSizes.length) params.set("accountSizes", selectedAccountSizes.join(","));
      const response = await fetch(`/api/promotions${params.size ? `?${params}` : ""}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load templates.");
      setTemplates(data.templates || []);
      setPresets(data.presets || []);
      setWarnings(data.warnings || []);
      const sizes = (data.availableAccountSizes || []).map(Number).filter(Number.isFinite);
      setAvailableAccountSizes(sizes);
      if (selectedAccountSizes.length === 0 && sizes.length) setSelectedAccountSizes(sizes.slice(0, 3));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load templates.",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedAccountSizes]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const startNewTemplate = () => {
    setSelectedId("");
    setName("New Promotion");
    setSubject("A special offer from Range4ex");
    setHtml(STARTER_HTML);
    setMessage("");
    setError("");
  };

  const selectTemplate = (template: PromotionTemplate) => {
    setSelectedId(template.id);
    setName(template.name);
    setSubject(template.subject);
    setHtml(template.html);
    setMessage("");
    setError("");
  };

  const selectPreset = (preset: PromotionTemplatePreset) => {
    setSelectedId("");
    setName(preset.name);
    setSubject(preset.subject);
    setHtml(preset.html);
    setPreviewMode(true);
    setMessage(
      `${preset.model} premium preset loaded. Review the offer before sending.`,
    );
    setError("");
  };

  const saveTemplate = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/promotions", {
        method: selectedId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(selectedId ? { id: selectedId } : {}),
          name,
          subject,
          html,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save template.");
      setSelectedId(data.template.id);
      setMessage("Template saved.");
      await fetchTemplates();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save template.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async () => {
    if (!selectedId || !window.confirm(`Delete the "${name}" template?`)) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        `/api/promotions?id=${encodeURIComponent(selectedId)}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete template.");
      startNewTemplate();
      setMessage("Template deleted.");
      await fetchTemplates();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete template.",
      );
    } finally {
      setSaving(false);
    }
  };

  const sendPromotion = async () => {
    setMessage("");
    setError("");
    if (html.includes("ADD-CODE")) {
      setError(
        "Replace ADD-CODE with a real active coupon code before sending this promotion.",
      );
      return;
    }
    if (invalidRecipients.length) {
      setError(`Fix invalid recipient${invalidRecipients.length === 1 ? "" : "s"}: ${invalidRecipients.join(", ")}`);
      return;
    }
    if (!validRecipients.length) {
      setError("Add at least one recipient email.");
      return;
    }
    if (validRecipients.length > 100) {
      setError("A promotion can contain at most 100 recipients.");
      return;
    }
    if (
      !window.confirm(
        `Send "${subject}" to ${validRecipients.length} recipient${validRecipients.length === 1 ? "" : "s"}?`,
      )
    ) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/promotions/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html, recipients: validRecipients }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send promotion.");

      if (data.failedCount) {
        setError(
          `Sent ${data.sentCount}; failed ${data.failedCount}: ${data.failed.join(", ")}`,
        );
      } else {
        setMessage(
          `Promotion sent successfully to ${data.sentCount} recipient${data.sentCount === 1 ? "" : "s"}.`,
        );
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send promotion.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Email Marketing"
        subtitle="Save reusable HTML templates and send one campaign to multiple email addresses"
      >
        <AdminButton variant="primary" onClick={startNewTemplate}>
          <IconPlus size={14} />
          New template
        </AdminButton>
      </AdminPageHeader>

      {(message || error) && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs ${
            error
              ? "border-red-500/25 bg-red-500/10 text-red-200"
              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {error || message}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          {warnings.map((warning) => (
            <p key={warning} className="not-first:mt-1">
              {warning}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="dash-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
              Template library
            </h4>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-neutral-400">
              {templates.length + presets.length}
            </span>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-xs text-neutral-500">
                Loading templates…
              </div>
            ) : (
              <>
                {presets.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="px-1 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-primary">
                      Premium presets
                    </p>
                    {presets.map((preset) => (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => selectPreset(preset)}
                        className="w-full rounded-xl border border-brand-primary/20 bg-brand-primary/[0.06] p-3 text-left transition hover:border-brand-primary/40 hover:bg-brand-primary/10"
                      >
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-primary">
                          Built-in · {preset.model}
                        </span>
                        <span className="mt-1 block truncate text-xs font-semibold text-white">
                          {preset.name}
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-neutral-500">
                          {preset.subject}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {templates.length > 0 && (
                  <p className="px-1 pt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-600">
                    Saved templates
                  </p>
                )}
                {templates.map((template) => (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedId === template.id
                        ? "border-brand-primary/40 bg-brand-primary/10"
                        : "border-white/5 bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="block truncate text-xs font-semibold text-white">
                      {template.name}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-neutral-500">
                      {template.subject}
                    </span>
                    <span className="mt-2 block text-[9px] uppercase tracking-wider text-neutral-600">
                      Updated {new Date(template.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
                {!templates.length && !presets.length && (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-neutral-500">
                    No templates available yet.
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="dash-card p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                  Template name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  className="w-full rounded-xl border border-white/10 bg-neutral-950/70 px-3.5 py-3 text-sm text-white outline-none transition focus:border-brand-primary/50"
                  placeholder="Summer offer"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                  Email subject
                </span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  maxLength={200}
                  className="w-full rounded-xl border border-white/10 bg-neutral-950/70 px-3.5 py-3 text-sm text-white outline-none transition focus:border-brand-primary/50"
                  placeholder="Your special Range4ex offer"
                />
              </label>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                    HTML email template
                  </span>
                  <p className="mt-1 text-[10px] text-neutral-600">
                    Use <code className="text-brand-primary">{"{{email}}"}</code> to insert each recipient address.
                  </p>
                </div>
                <div className="flex rounded-lg border border-white/10 bg-neutral-950/60 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                      !previewMode ? "bg-white text-black" : "text-neutral-400"
                    }`}
                  >
                    <IconCode size={13} />
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                      previewMode ? "bg-white text-black" : "text-neutral-400"
                    }`}
                  >
                    <IconEye size={13} />
                    Preview
                  </button>
                </div>
              </div>

              {previewMode ? (
                <iframe
                  title="Promotion email preview"
                  sandbox=""
                  srcDoc={html}
                  className="h-[520px] w-full rounded-xl border border-white/10 bg-white"
                />
              ) : (
                <textarea
                  value={html}
                  onChange={(event) => setHtml(event.target.value)}
                  spellCheck={false}
                  className="h-[520px] w-full resize-y rounded-xl border border-white/10 bg-neutral-950/80 p-4 font-mono text-xs leading-6 text-neutral-200 outline-none transition focus:border-brand-primary/50"
                />
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={deleteTemplate}
                disabled={!selectedId || saving}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconTrash size={14} />
                Delete
              </button>
              <button
                type="button"
                onClick={saveTemplate}
                disabled={saving || !name.trim() || !subject.trim() || !html.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconDeviceFloppy size={15} />
                {saving ? "Saving…" : selectedId ? "Update template" : "Save template"}
              </button>
            </div>

            {availableAccountSizes.length > 0 && (
              <div className="mt-5 border-t border-white/[0.07] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">Account sizes in preset</span>
                    <p className="mt-1 text-[10px] text-neutral-600">Choose up to three sizes, then load a built-in template.</p>
                  </div>
                  <span className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-2 py-1 text-[10px] font-semibold text-brand-primary">{selectedAccountSizes.length}/3 selected</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableAccountSizes.map((size) => {
                    const selected = selectedAccountSizes.includes(size);
                    return (
                      <button key={size} type="button" aria-pressed={selected} onClick={() => toggleAccountSize(size)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${selected ? "border-brand-primary bg-brand-primary/15 text-white" : "border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20"}`}>
                        ${(size / 1000).toFixed(0)}K
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/[0.08] to-bg-card/70 p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-primary/15 p-2.5 text-brand-primary">
                <IconSend size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Campaign recipients (select users or add emails)
                </h4>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Paste up to 100 addresses separated by commas, spaces, semicolons, or new lines.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUserSelector(!showUserSelector)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/[0.08]"
              >
                {showUserSelector ? "Hide User List" : "Select from Users"}
              </button>
              {users.length > 0 && (
                <button
                  type="button"
                  onClick={addAllEmails}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-primary/20 bg-brand-primary/[0.05] px-3 py-1.5 text-[11px] font-semibold text-brand-primary transition hover:bg-brand-primary/10"
                >
                  Select All ({users.length})
                </button>
              )}
              {recipients.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllEmails}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-[11px] font-semibold text-neutral-400 transition hover:bg-white/[0.06]"
                >
                  Clear All
                </button>
              )}
            </div>

            {showUserSelector && (
              <div className="mt-3 rounded-xl border border-white/10 bg-neutral-950/40 p-3.5 space-y-3">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full rounded-lg border border-white/10 bg-neutral-950/60 px-3 py-2 text-xs text-white outline-none transition focus:border-brand-primary/50"
                />
                
                <div className="max-h-[160px] overflow-y-auto divide-y divide-white/5 pr-1">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u: any) => {
                      const isSelected = recipients.includes((u.email || "").toLowerCase());
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleEmail(u.email)}
                          className="flex w-full items-center justify-between py-2 text-left text-xs transition hover:bg-white/[0.02] px-2 rounded-lg"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="block font-medium text-white truncate">{u.name || "Unnamed User"}</span>
                            <span className="block text-[10px] text-neutral-500 truncate">{u.email}</span>
                          </div>
                          <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${
                            isSelected 
                              ? "bg-brand-primary border-brand-primary text-white" 
                              : "border-white/20"
                          }`}>
                            {isSelected && (
                              <svg className="h-2.5 w-2.5 stroke-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-xs text-neutral-500 font-mono">
                      No users match search
                    </div>
                  )}
                </div>
              </div>
            )}

            <textarea
              value={recipientInput}
              onChange={(event) => setRecipientInput(event.target.value)}
              rows={6}
              className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-neutral-950/75 p-4 font-mono text-xs leading-6 text-neutral-200 outline-none transition focus:border-brand-primary/50"
              placeholder={"trader1@example.com\ntrader2@example.com, trader3@example.com"}
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px]">
                <span className="text-neutral-400">
                  {validRecipients.length} valid recipient{validRecipients.length === 1 ? "" : "s"}
                </span>
                {invalidRecipients.length > 0 && (
                  <span className="ml-3 text-red-300">
                    {invalidRecipients.length} invalid
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={sendPromotion}
                disabled={sending || !validRecipients.length || invalidRecipients.length > 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-xs font-bold text-white shadow-lg shadow-brand-primary/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconSend size={15} />
                {sending
                  ? "Sending…"
                  : `Send to ${validRecipients.length || 0} recipient${validRecipients.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
