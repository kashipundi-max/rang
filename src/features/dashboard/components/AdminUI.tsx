"use client";

/**
 * Shared admin chrome.
 *
 * Every CRM desk — including the tabs that live in their own files — builds
 * from these so the admin reads as one product: the trader dashboard's
 * `.dash-card` surface, one page header, one table shell, one set of
 * micro-labels.
 */

import React from "react";
import { createPortal } from "react-dom";
import { IconRefresh, IconArrowUpRight, IconSearch, IconCopy, IconCheck } from "./Icons";

/* ------------------------------------------------------------------ *
 * Shared admin chrome
 *
 * The admin desks used to each invent their own header, stat card and
 * table shell. These three primitives are the single source of truth so
 * every desk reads as one product: a flat near-black surface, a hairline
 * rim, uppercase micro-labels and one accent per tile.
 * ------------------------------------------------------------------ */

export const ADMIN_ACCENTS = {
  blue: {
    tile: "from-blue-500/[0.10] to-transparent border-blue-500/20 hover:border-blue-400/45",
    chip: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
  orange: {
    tile: "from-orange-500/[0.10] to-transparent border-orange-500/20 hover:border-orange-400/45",
    chip: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  },
  emerald: {
    tile: "from-emerald-500/[0.10] to-transparent border-emerald-500/20 hover:border-emerald-400/45",
    chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
  violet: {
    tile: "from-violet-500/[0.10] to-transparent border-violet-500/20 hover:border-violet-400/45",
    chip: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  },
  fuchsia: {
    tile: "from-fuchsia-500/[0.10] to-transparent border-fuchsia-500/20 hover:border-fuchsia-400/45",
    chip: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
  },
  cyan: {
    tile: "from-cyan-500/[0.10] to-transparent border-cyan-500/20 hover:border-cyan-400/45",
    chip: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  },
  amber: {
    tile: "from-amber-500/[0.10] to-transparent border-amber-500/20 hover:border-amber-400/45",
    chip: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  rose: {
    tile: "from-rose-500/[0.10] to-transparent border-rose-500/20 hover:border-rose-400/45",
    chip: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  },
} as const;

export type AdminAccent = keyof typeof ADMIN_ACCENTS;

/** Page title bar shared by every admin desk. */
export function AdminPageHeader({
  title,
  subtitle,
  onRefresh,
  refreshing = false,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Ignored — the sidebar is the navigation. Kept so existing callers compile. */
  onBack?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[13px] text-neutral-500">{subtitle}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {children}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconRefresh size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Section shell. Every desk's content sits in one of these so panels line up
 * across pages instead of each desk inventing its own gradient and padding.
 */
export function AdminPanel({
  title,
  subtitle,
  actions,
  children,
  bodyClassName = "",
  flush = false,
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
  /** Drop the body padding — for panels whose child is a full-bleed table. */
  flush?: boolean;
}) {
  const hasHeader = Boolean(title || actions);
  return (
    <div className="dash-card">
      {hasHeader && (
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold tracking-tight text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[11px] text-neutral-500">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={`${flush ? "" : "p-5"} ${bodyClassName}`}>{children}</div>
    </div>
  );
}

/** Labelled dropdown used by every desk's filter row. */
export function AdminSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full cursor-pointer rounded-lg border border-white/[0.08] bg-black/30 px-3 text-xs font-medium text-white outline-none transition-colors hover:border-white/20 focus:border-brand-primary/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-neutral-950">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Inline spinner. `.animate-spin` is the one animation the static dashboard keeps. */
export function Spinner({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden
      className={`shrink-0 animate-spin ${className}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function AdminButton({
  children,
  onClick,
  variant = "ghost",
  type = "button",
  disabled = false,
  loading = false,
  title,
  className = "",
  form,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  /** Id of a form elsewhere in the DOM this button submits (e.g. from a modal footer). */
  form?: string;
  variant?: "primary" | "ghost" | "danger" | "success";
  type?: "button" | "submit";
  disabled?: boolean;
  /** Shows a spinner and blocks clicks while the action is in flight. */
  loading?: boolean;
  title?: string;
  className?: string;
}) {
  const variantClass =
    variant === "primary"
      ? "border-white bg-white text-black hover:bg-neutral-200"
      : variant === "success"
        ? "border-emerald-500 bg-emerald-500 text-black hover:bg-emerald-400"
        : variant === "danger"
          ? "border-rose-500/25 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:text-white"
          : "border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white";
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${className}`}
    >
      {loading && <Spinner size={13} />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Status badge
 *
 * One pill for every status in the CRM, so "Paid", "Approved", "Delivered"
 * all read the same everywhere. Tone is derived from the word itself.
 * ------------------------------------------------------------------ */

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "border-white/10 bg-white/[0.04] text-neutral-300",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  danger: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  info: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  accent: "border-violet-500/25 bg-violet-500/10 text-violet-300",
};

/** Maps any status string the API uses onto a badge tone. */
export function statusTone(status: unknown): BadgeTone {
  const value = String(status || "").toLowerCase();
  if (!value) return "neutral";
  if (/(fail|reject|declin|cancel|expired|breach|error|refund)/.test(value)) return "danger";
  if (/(live|funded)/.test(value)) return "accent";
  if (/(pending|unpaid|await|review|request|partial|scheduled|paused)/.test(value)) return "warning";
  if (/(passed|step2|phase 2)/.test(value)) return "info";
  if (/(paid|active|approved|verified|delivered|success|complete|sent)/.test(value)) return "success";
  return "neutral";
}

export function AdminBadge({
  children,
  tone,
  status,
  dot = false,
}: {
  children?: React.ReactNode;
  tone?: BadgeTone;
  /** Pass the raw status to derive both the tone and (if no children) the label. */
  status?: unknown;
  dot?: boolean;
}) {
  const resolved = tone || statusTone(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${BADGE_TONES[resolved]}`}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children ?? String(status || "—").replace(/_/g, " ")}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Modal
 * ------------------------------------------------------------------ */

const openModals: object[] = [];

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** While true the modal can't be dismissed, so a save can't be abandoned half-way. */
  busy?: boolean;
}) {
  const busyRef = React.useRef(busy);
  busyRef.current = busy;
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (!open) return;
    // Stacked modals (e.g. a confirm over a profile): Escape closes the top one only.
    const token = {};
    openModals.push(token);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || openModals[openModals.length - 1] !== token) return;
      if (!busyRef.current) onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      openModals.splice(openModals.indexOf(token), 1);
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const width =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : size === "xl" ? "max-w-5xl" : "max-w-xl";

  return createPortal(
    <div className="fixed inset-0 z-[2147483000] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-black/75"
        onClick={() => {
          if (!busyRef.current) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex max-h-[calc(100dvh-24px)] w-full ${width} flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0a14] text-sm text-neutral-300 shadow-[0_30px_100px_rgba(0,0,0,0.7)] sm:max-h-[calc(100dvh-48px)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-xs text-neutral-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.07] bg-black/20 px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Label/value list used inside detail modals. */
export function AdminDetailList({ rows }: { rows: [React.ReactNode, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-white/[0.05]">
      {rows.map(([label, value], index) => (
        <div key={index} className="flex items-start justify-between gap-5 py-2.5 text-[13px]">
          <dt className="shrink-0 text-neutral-500">{label}</dt>
          <dd className="min-w-0 break-words text-right font-medium text-neutral-100">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ *
 * Row actions menu
 *
 * Tables keep one or two primary buttons visible and tuck the rest
 * behind "⋯". Rendered through a portal with fixed positioning so the
 * table's own overflow never clips it.
 * ------------------------------------------------------------------ */

export type AdminMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
  tone?: "neutral" | "danger";
};

export function AdminRowMenu({ items, label = "More actions" }: { items: AdminMenuItem[]; label?: string }) {
  const [position, setPosition] = React.useState<{ top: number; right: number; up: boolean } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(() => setPosition(null), []);

  React.useEffect(() => {
    if (!position) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [position, close]);

  const toggle = () => {
    if (position) return close();
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Open upward only when it doesn't fit below and there is more room above.
    const menuHeight = items.length * 38 + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const up = spaceBelow < menuHeight && rect.top > spaceBelow;
    setPosition({
      top: up ? rect.top - 6 : rect.bottom + 6,
      right: window.innerWidth - rect.right,
      up,
    });
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        title={label}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={Boolean(position)}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
          position
            ? "border-white/20 bg-white/[0.08] text-white"
            : "border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-white"
        }`}
      >
        <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </button>
      {position &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[2147483001]" onClick={close} />
            <div
              role="menu"
              className="fixed z-[2147483002] min-w-[210px] rounded-xl border border-white/10 bg-[#141019] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.6)]"
              style={{
                right: position.right,
                ...(position.up ? { bottom: window.innerHeight - position.top } : { top: position.top }),
              }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  title={item.hint}
                  onClick={() => {
                    close();
                    item.onClick();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                    item.tone === "danger"
                      ? "text-rose-300 hover:bg-rose-500/10"
                      : "text-neutral-200 hover:bg-white/[0.06]"
                  }`}
                >
                  {item.icon && <span className="text-neutral-500">{item.icon}</span>}
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Feedback: toasts, confirm and reason dialogs
 *
 * Replaces the browser's alert()/confirm()/prompt(), which block the page
 * and look like an error from the browser rather than part of the CRM.
 * A tiny module-level store means any handler can call `adminToast.success`
 * without threading context; <AdminFeedbackHost /> renders it once.
 * ------------------------------------------------------------------ */

type Toast = { id: number; tone: "success" | "error" | "info"; message: string };
type Dialog = {
  id: number;
  title: string;
  message?: string;
  confirmLabel: string;
  tone: "primary" | "danger";
  /** When set the dialog asks for a reason and resolves with the text. */
  input?: { placeholder?: string; required?: boolean };
  resolve: (value: string | null) => void;
};

type FeedbackState = { toasts: Toast[]; dialog: Dialog | null };
let feedbackState: FeedbackState = { toasts: [], dialog: null };
const feedbackListeners = new Set<() => void>();
let feedbackSeq = 0;

function setFeedback(next: Partial<FeedbackState>) {
  feedbackState = { ...feedbackState, ...next };
  feedbackListeners.forEach((listener) => listener());
}

function pushToast(tone: Toast["tone"], message: string) {
  const id = ++feedbackSeq;
  setFeedback({ toasts: [...feedbackState.toasts, { id, tone, message }].slice(-4) });
  window.setTimeout(
    () => setFeedback({ toasts: feedbackState.toasts.filter((toast) => toast.id !== id) }),
    tone === "error" ? 6000 : 3500,
  );
}

export const adminToast = {
  success: (message: string) => pushToast("success", message),
  error: (message: string) => pushToast("error", message),
  info: (message: string) => pushToast("info", message),
};

function openDialog(options: Omit<Dialog, "id" | "resolve">) {
  return new Promise<string | null>((resolve) => {
    feedbackState.dialog?.resolve(null);
    setFeedback({ dialog: { ...options, id: ++feedbackSeq, resolve } });
  });
}

/** Promise-based confirm. Resolves true when the admin confirms. */
export async function adminConfirm(options: {
  title: string;
  message?: string;
  confirmLabel?: string;
  tone?: "primary" | "danger";
}) {
  const result = await openDialog({
    title: options.title,
    message: options.message,
    confirmLabel: options.confirmLabel || "Confirm",
    tone: options.tone || "primary",
  });
  return result !== null;
}

/** Promise-based reason prompt. Resolves with the text, or null if cancelled. */
export function adminPrompt(options: {
  title: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  required?: boolean;
  tone?: "primary" | "danger";
}) {
  return openDialog({
    title: options.title,
    message: options.message,
    confirmLabel: options.confirmLabel || "Submit",
    tone: options.tone || "primary",
    input: { placeholder: options.placeholder, required: options.required ?? true },
  });
}

function useFeedbackState() {
  return React.useSyncExternalStore(
    (listener) => {
      feedbackListeners.add(listener);
      return () => feedbackListeners.delete(listener);
    },
    () => feedbackState,
    () => feedbackState,
  );
}

function FeedbackDialog({ dialog }: { dialog: Dialog }) {
  const [text, setText] = React.useState("");
  const finish = (value: string | null) => {
    dialog.resolve(value);
    setFeedback({ dialog: null });
  };
  const canSubmit = !dialog.input?.required || text.trim().length > 0;

  return (
    <AdminModal
      open
      size="sm"
      onClose={() => finish(null)}
      title={dialog.title}
      footer={
        <>
          <AdminButton onClick={() => finish(null)}>Cancel</AdminButton>
          <AdminButton
            variant={dialog.tone === "danger" ? "danger" : "primary"}
            disabled={!canSubmit}
            onClick={() => finish(dialog.input ? text.trim() : "ok")}
          >
            {dialog.confirmLabel}
          </AdminButton>
        </>
      }
    >
      {dialog.message && (
        <p className="whitespace-pre-line text-[13px] leading-relaxed text-neutral-400">{dialog.message}</p>
      )}
      {dialog.input && (
        <textarea
          autoFocus
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={dialog.input.placeholder}
          className={`${dialog.message ? "mt-4" : ""} w-full resize-none rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-neutral-600 focus:border-white/25`}
        />
      )}
    </AdminModal>
  );
}

/** Mount once inside the CRM. Renders toasts and the active confirm/prompt dialog. */
export function AdminFeedbackHost() {
  const state = useFeedbackState();
  if (typeof document === "undefined") return null;

  return (
    <>
      {state.dialog && <FeedbackDialog key={state.dialog.id} dialog={state.dialog} />}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[2147483003] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2">
          {state.toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 bg-[#141019] px-4 py-3 text-[13px] text-neutral-100 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
            >
              <span
                aria-hidden
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  toast.tone === "success" ? "bg-emerald-400" : toast.tone === "error" ? "bg-rose-400" : "bg-sky-400"
                }`}
              />
              <span className="min-w-0 flex-1 leading-snug">{toast.message}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setFeedback({ toasts: feedbackState.toasts.filter((item) => item.id !== toast.id) })}
                className="text-neutral-500 hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

export function AdminEmptyState({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="text-neutral-700">{icon}</span>
      <h4 className="mt-3 text-sm font-semibold text-white">{title}</h4>
      {hint && <p className="mt-1 text-xs text-neutral-600">{hint}</p>}
    </div>
  );
}

/** Table shell: one header row treatment shared by every desk's list. */
export function AdminTable({
  columns,
  children,
  minWidth = 900,
  dense = false,
  bordered = false,
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  children: React.ReactNode;
  minWidth?: number;
  /** Smaller header text and padding, for wide ledgers. */
  dense?: boolean;
  /** Spreadsheet-style grid: a hairline between every row and every column. */
  bordered?: boolean;
}) {
  return (
    <div className={`overflow-x-auto ${dense ? "admin-compact" : ""}`}>
      <table
        className={`w-full border-collapse text-left ${
          bordered
            ? "[&_td]:border-b [&_td]:border-r [&_td]:border-white/[0.07] [&_th]:border-r [&_th]:border-white/[0.07] [&_td:last-child]:border-r-0 [&_th:last-child]:border-r-0 [&_tr:last-child_td]:border-b-0"
            : ""
        }`}
        style={{ minWidth: `${minWidth}px` }}
      >
        <thead>
          <tr className="border-b border-white/[0.06]">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap font-medium text-neutral-500 ${
                  dense ? "bg-white/[0.02] px-3 py-2.5 text-[11px]" : "px-4 py-3 text-xs"
                } ${
                  column.align === "right" ? "text-right" : ""
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Cell padding for `dense bordered` ledgers — the Orders desk layout every desk shares. */
export const ADMIN_TD = "px-3 py-2.5 align-middle";
export const ADMIN_TR = "transition-colors hover:bg-white/[0.02]";

export type AdminFilterOption = { label: string; value: string; count?: number };

/** Search box + filter pills that sit on top of a ledger (Orders desk style). */
export function AdminToolbar({
  search,
  onSearch,
  placeholder = "Search",
  filters,
  filter,
  onFilter,
  actions,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  filters?: AdminFilterOption[];
  filter?: string;
  onFilter?: (value: string) => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-white/[0.06] p-4">
      {(onSearch || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {onSearch ? (
            <div className="relative w-full lg:max-w-sm">
              <IconSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={14}
              />
              <input
                type="search"
                placeholder={placeholder}
                value={search || ""}
                onChange={(event) => onSearch(event.target.value)}
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/25 pl-9 pr-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/25"
              />
            </div>
          ) : (
            <span />
          )}
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {filters && filters.length > 0 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {filters.map((option) => {
            const isSelected = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilter?.(option.value)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected ? "bg-white text-black" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {option.label}
                {option.count !== undefined && (
                  <span className={`tabular-nums ${isSelected ? "text-black/55" : "text-neutral-600"}`}>
                    {option.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** "Showing X of Y" strip under a ledger. */
export function AdminTableFooter({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  return (
    <div className="border-t border-white/[0.06] px-4 py-3 text-xs text-neutral-500">
      Showing {shown} of {total} {noun}
    </div>
  );
}

/** Small copy-to-clipboard value used inside ledger cells. */
export function AdminCopyValue({
  value,
  copied,
  onCopy,
  mono = true,
  maxWidth = 160,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
  mono?: boolean;
  maxWidth?: number;
}) {
  if (!value) return <span className="text-[11px] text-neutral-600">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`truncate text-xs text-white ${mono ? "font-mono" : ""}`}
        style={{ maxWidth }}
        title={value}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onCopy}
        title="Copy"
        className="shrink-0 text-neutral-500 transition-colors hover:text-white"
      >
        {copied ? <IconCheck size={12} className="text-emerald-400" /> : <IconCopy size={12} />}
      </button>
    </span>
  );
}

/** Square icon button used in every table's Actions column. */
export function AdminIconButton({
  icon,
  label,
  onClick,
  disabled = false,
  loading = false,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "neutral" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-rose-500/20 bg-rose-500/[0.07] text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-white"
      : "border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${toneClass}`}
    >
      {loading ? <Spinner size={14} /> : icon}
    </button>
  );
}

/** Compact metric tile: micro-label, one number, one tinted glyph. */
export function AdminStatCard({
  label,
  value,
  hint,
  icon,
  accent = "blue",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  accent?: AdminAccent;
}) {
  return (
    <div className="dash-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-neutral-500">
          {label}
        </span>
        {icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${ADMIN_ACCENTS[accent].chip}`}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </div>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

/** Quick-navigation tile on the control dashboard. */
export function AdminWorkflowCard({
  title,
  description,
  icon,
  accent,
  badge,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: AdminAccent;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dash-card group flex w-full flex-col bg-gradient-to-br p-5 text-left transition-transform duration-300 hover:-translate-y-0.5 ${ADMIN_ACCENTS[accent].tile}`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${ADMIN_ACCENTS[accent].chip}`}
        >
          {icon}
        </span>
        <span className="flex items-center gap-2">
          {badge !== undefined && badge > 0 && (
            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
              {badge}
            </span>
          )}
          <IconArrowUpRight
            size={16}
            className="text-neutral-600 transition-colors group-hover:text-white"
          />
        </span>
      </div>
      <h4 className="mt-6 text-base font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{description}</p>
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Analytics primitives
 *
 * Chart colours are steps chosen for THIS surface (roughly #100c16) and
 * validated as a set — lightness band, chroma floor, CVD separation,
 * normal-vision separation and 3:1 contrast all pass. The emerald/amber
 * pair sits in the CVD floor band, which is why every mark below is also
 * direct-labelled: hue never carries meaning on its own here.
 * ------------------------------------------------------------------ */

/** Chart surface colour — the 2px gaps and marker rings are drawn in it. */
export const VIZ_SURFACE = "#100c16";
export const VIZ = {
  brand: "#a855f7",
  orange: "#ea580c",
  good: "#059669",
  warning: "#d97706",
  critical: "#e11d48",
  info: "#0284c7",
} as const;

export function AdminChartCard({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="dash-card flex flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold tracking-tight text-white">
            {title}
          </h4>
          <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">
            {subtitle}
          </p>
        </div>
        {badge}
      </div>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}

export function AdminChartBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "up" | "down";
}) {
  const toneClass =
    tone === "up"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
      : tone === "down"
        ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
        : "border-white/10 bg-white/[0.04] text-neutral-400";
  return (
    <span
      className={`shrink-0 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold whitespace-nowrap ${toneClass}`}
    >
      {children}
    </span>
  );
}

/**
 * One labelled ratio. The label and value are always rendered, so the bar is
 * a second reading of the number rather than the only one.
 */
export function AdminMeter({
  label,
  value,
  percent,
  color,
  note,
}: {
  label: string;
  value: React.ReactNode;
  percent: number;
  color: string;
  note?: string;
}) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2 text-[12px] font-medium text-neutral-300">
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
        <span className="text-[12px] font-semibold text-white tabular-nums">
          {value}
        </span>
      </div>
      {/* Track is a faint step of the fill's own hue, so state reads across
          the whole bar rather than only where it is filled. */}
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`,
        }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      {note && <p className="text-[10px] text-neutral-600">{note}</p>}
    </div>
  );
}

/**
 * Single-series area chart. Axis ticks live in a gutter beside the plot
 * rather than floating over it, and each day gets a full-height hover band
 * so the hit target is the column, not the 4px dot.
 */
export function AdminTrendChart({
  trend,
  color,
  unit,
  gradientId,
}: {
  trend: {
    max: number;
    total: number;
    points: { label: string; value: number; x: number; y: number }[];
    line: string;
    area: string;
  };
  color: string;
  unit: string;
  gradientId: string;
}) {
  const last = trend.points.at(-1);
  const bandWidth =
    trend.points.length > 1 ? 100 / (trend.points.length - 1) : 100;

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex h-40 w-10 shrink-0 flex-col justify-between py-1 text-right font-mono text-[9px] text-neutral-600 tabular-nums">
          <span>{trend.max}</span>
          <span>{Math.round(trend.max / 2)}</span>
          <span>0</span>
        </div>
        <div className="relative h-40 min-w-0 flex-1">
          <svg
            className="h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${unit} per day over the last ${trend.points.length} days`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {[10, 52, 94].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.4"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <path d={trend.area} fill={`url(#${gradientId})`} />
            <path
              d={trend.line}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {last && (
              <circle
                cx={last.x}
                cy={last.y}
                r="2.4"
                fill={color}
                stroke={VIZ_SURFACE}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Full-height hover bands — the hit target is the whole column. */}
            {trend.points.map((point) => (
              <rect
                key={point.label}
                x={Math.max(0, point.x - bandWidth / 2)}
                y="0"
                width={bandWidth}
                height="100"
                fill="transparent"
                className="cursor-crosshair hover:fill-white/[0.04]"
              >
                <title>{`${point.label}: ${point.value} ${unit}`}</title>
              </rect>
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-13 font-mono text-[9px] text-neutral-600">
        <span>{trend.points[0]?.label}</span>
        <span>{trend.points.at(-1)?.label}</span>
      </div>
    </div>
  );
}
