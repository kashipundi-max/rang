// DEPRECATED: This client-side localStorage database is deprecated.
// All components now call the backend API endpoints (/api/...) directly,
// which retrieve and store state in Supabase.

export function initClientDb() {
  // Deprecated - no-op
}

export function getClientDb() {
  console.warn("Call to deprecated getClientDb()");
  return {
    users: [],
    kyc: [],
    orders: [],
    challenge_plans: [],
    trading_accounts: [],
    payouts: [],
    affiliates: [],
    referrals: [],
    certificates: [],
    notifications: [],
    audit_logs: []
  };
}

export function saveClientDb(db: any) {
  // Deprecated - no-op
}

export function getClientSessionUserId(): string {
  if (typeof window === "undefined") return "u-trader";
  const storedId = window.localStorage.getItem("prop_session_userId");
  if (storedId) return storedId;
  const match = document.cookie.match(/(?:^|; )prop_session=([^;]*)/);
  if (match && match[1]) {
    window.localStorage.setItem("prop_session_userId", match[1]);
    return match[1];
  }
  return "u-trader";
}
