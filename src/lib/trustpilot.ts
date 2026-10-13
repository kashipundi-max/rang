// Client-side helpers for the Trustpilot invitation script loaded in
// src/components/analytics/TrustpilotScript.tsx.

declare global {
  interface Window {
    tp?: (...args: any[]) => void;
  }
}

const HISTORY_STORAGE_KEY = "range4ex_trustpilot_invites";
const HISTORY_LIMIT = 50;

export type TrustpilotInvitation = {
  recipientEmail: string;
  recipientName: string;
  referenceId: string;
  tags?: string[];
  locationId?: string;
  templateId?: string;
};

export type TrustpilotInvitationRecord = TrustpilotInvitation & { sentAt: string };

export function isTrustpilotReady() {
  return typeof window !== "undefined" && typeof window.tp === "function";
}

export function createTrustpilotInvitation(invitation: TrustpilotInvitation) {
  if (!isTrustpilotReady()) {
    throw new Error("Trustpilot script is not loaded on this page. Reload and try again.");
  }

  // Optional fields are only sent when filled in — an empty templateId or
  // locationId would make Trustpilot reject the invitation.
  window.tp!("createInvitation", {
    recipientEmail: invitation.recipientEmail,
    recipientName: invitation.recipientName,
    referenceId: invitation.referenceId,
    source: "InvitationScript",
    ...(invitation.tags?.length ? { tags: invitation.tags } : {}),
    ...(invitation.locationId ? { locationId: invitation.locationId } : {}),
    ...(invitation.templateId ? { templateId: invitation.templateId } : {}),
  });

  const record: TrustpilotInvitationRecord = { ...invitation, sentAt: new Date().toISOString() };
  try {
    const history = getTrustpilotInvitationHistory();
    window.localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify([record, ...history].slice(0, HISTORY_LIMIT)),
    );
  } catch {
    // Storage blocked — the invitation itself was still queued.
  }
  return record;
}

/** Invitations sent from this browser, newest first. */
export function getTrustpilotInvitationHistory(): TrustpilotInvitationRecord[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
