"use client";

import { useEffect, useState } from "react";
import { IconPlus, IconUsersGroup } from "@tabler/icons-react";
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatCard,
  AdminTable,
  AdminButton,
  AdminEmptyState,
  AdminBadge,
  AdminModal,
  AdminToolbar,
  AdminTableFooter,
  ADMIN_TD,
  ADMIN_TR,
} from "../AdminUI";

const money = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value || 0);

const CREATE_FIELDS = [
  ["name", "Full name", "text"],
  ["email", "Email address", "email"],
  ["password", "Temporary password", "password"],
  ["referralCode", "Referral code (optional)", "text"],
] as const;

export default function CollaboratorSalesTab() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/collaborators");
      const result = await response.json();
      if (response.ok) setData(result);
      else setError(result.error || "Unable to load collaborator sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError("");
    const response = await fetch("/api/collaborators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setCreating(false);
    if (!response.ok) {
      setError(result.error || "Unable to create collaborator.");
      return;
    }
    setForm({ name: "", email: "", password: "", referralCode: "" });
    setShowForm(false);
    await load();
  };

  const markPaid = async (sale: any) => {
    const response = await fetch("/api/collaborators", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referredUserId: sale.referredUserId,
        orderId: sale.orderId,
        status: "paid",
      }),
    });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error || "Unable to mark commission as paid.");
      return;
    }
    await load();
  };

  const collaborators: any[] = data?.collaborators || [];
  const sum = (pick: (collaborator: any) => number) =>
    collaborators.reduce((total, collaborator) => total + pick(collaborator), 0);
  const registrations = sum((c) => c.metrics.registrations);
  const total = sum((c) => c.metrics.totalSales);
  const commissions = sum((c) => c.metrics.commissions);

  const query = search.trim().toLowerCase();
  const rows = collaborators.filter(
    (c) =>
      !query ||
      [c.name, c.email, c.referralCode].some((v) =>
        String(v || "").toLowerCase().includes(query),
      ),
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Collaborator sales"
        subtitle="A separate 20% commission program — legacy affiliate referrals are not shown or changed here."
        onRefresh={load}
        refreshing={loading}
      />

      {error && (
        <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminStatCard label="Collaborators" value={collaborators.length} hint="Accounts in the program" />
        <AdminStatCard label="Registrations" value={registrations} hint="Traders referred in total" />
        <AdminStatCard label="Sales" value={money(total)} hint="Gross value of referred orders" />
        <AdminStatCard label="20% commissions" value={money(commissions)} hint="Owed across all collaborators" />
      </div>

      <AdminPanel flush>
        <AdminToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search name, email or code"
          actions={
            <AdminButton variant="primary" onClick={() => setShowForm(true)}>
              <IconPlus size={14} />
              New collaborator
            </AdminButton>
          }
        />

        {rows.length === 0 ? (
          <AdminEmptyState
            icon={<IconUsersGroup size={28} />}
            title={collaborators.length === 0 ? "No collaborator accounts yet" : "No collaborators found"}
            hint={
              collaborators.length === 0
                ? "Create one to start tracking referred sales and commissions."
                : "Try another search."
            }
          />
        ) : (
          <>
            <AdminTable
              minWidth={900}
              dense
              bordered
              columns={[
                { key: "collaborator", label: "Collaborator" },
                { key: "code", label: "Code" },
                { key: "registrations", label: "Registrations" },
                { key: "sales", label: "Sales" },
                { key: "commission", label: "Commission" },
                { key: "unpaid", label: "Unpaid" },
                { key: "payout", label: "Actions", align: "right" },
              ]}
            >
              {rows.map((collaborator: any) => {
                const unpaid = (collaborator.sales || []).filter((sale: any) => sale.status !== "paid");
                const nextUnpaid = unpaid[0];
                const paying = payingId === collaborator.userId;
                return (
                  <tr key={collaborator.userId} className={ADMIN_TR}>
                    <td className={`max-w-[240px] ${ADMIN_TD}`}>
                      <span className="block truncate text-xs font-medium text-white">{collaborator.name}</span>
                      <span className="block truncate text-[11px] text-neutral-500">{collaborator.email}</span>
                    </td>
                    <td className={`font-mono text-xs text-neutral-300 ${ADMIN_TD}`}>{collaborator.referralCode}</td>
                    <td className={`text-xs text-neutral-300 tabular-nums ${ADMIN_TD}`}>
                      {collaborator.metrics.registrations}
                    </td>
                    <td className={`text-xs font-medium text-white tabular-nums ${ADMIN_TD}`}>
                      {money(collaborator.metrics.totalSales)}
                    </td>
                    <td className={`text-xs text-emerald-300 tabular-nums ${ADMIN_TD}`}>
                      {money(collaborator.metrics.commissions)}
                    </td>
                    <td className={ADMIN_TD}>
                      {unpaid.length > 0 ? (
                        <AdminBadge tone="warning">{unpaid.length} unpaid</AdminBadge>
                      ) : (
                        <AdminBadge tone="success">Up to date</AdminBadge>
                      )}
                    </td>
                    <td className={ADMIN_TD}>
                      <div className="flex items-center justify-end">
                        {nextUnpaid ? (
                          <AdminButton
                            loading={paying}
                            onClick={async () => {
                              setPayingId(collaborator.userId);
                              try {
                                await markPaid(nextUnpaid);
                              } finally {
                                setPayingId(null);
                              }
                            }}
                          >
                            Mark next paid
                          </AdminButton>
                        ) : (
                          <span className="text-[11px] text-neutral-600">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </AdminTable>
            <AdminTableFooter shown={rows.length} total={collaborators.length} noun="collaborators" />
          </>
        )}
      </AdminPanel>

      <AdminModal
        open={showForm}
        size="sm"
        busy={creating}
        onClose={() => setShowForm(false)}
        title="New collaborator"
        subtitle="There is no public collaborator registration — accounts are made here."
        footer={
          <>
            <AdminButton onClick={() => setShowForm(false)}>Cancel</AdminButton>
            <AdminButton variant="primary" type="submit" form="collaborator-form" loading={creating}>
              Create collaborator
            </AdminButton>
          </>
        }
      >
        <form id="collaborator-form" onSubmit={create} className="space-y-4">
          {CREATE_FIELDS.map(([key, label, type]) => (
            <label key={key} className="block space-y-1.5">
              <span className="block text-xs font-medium text-neutral-400">{label}</span>
              <input
                type={type}
                required={key !== "referralCode"}
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/25 px-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/25"
              />
            </label>
          ))}
        </form>
      </AdminModal>
    </div>
  );
}
