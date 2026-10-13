import { db, DBOrder, DBTradingAccount, DBUser } from "./db";
import { getChallengeRule } from "./rulebook";
import { recordCollaboratorSale } from "./collaborators";
import { sendMetaConversionEvent } from "./metaConversionsApi";
import { grantBogoOffersForOrder } from "./offerGrants";

function normalizePlatform(platform?: string) {
  return String(platform || "MT5").trim().toLowerCase();
}

export async function reserveInventoryAccount(order: DBOrder, platform: string, size: number) {
  let inventory;
  try {
    inventory = await db.getChallengeInventory();
  } catch (error) {
    console.warn("Challenge inventory lookup failed; falling back to manual delivery.", error);
    return undefined;
  }

  const matchingAccount = inventory.find((item) => {
    return (
      item.status === "available" &&
      normalizePlatform(item.platform) === normalizePlatform(platform) &&
      Number(item.size) === Number(size)
    );
  });

  if (!matchingAccount) return undefined;

  matchingAccount.status = "delivered";
  matchingAccount.orderId = order.id;
  try {
    return await db.saveChallengeInventoryItem(matchingAccount);
  } catch (error) {
    console.warn("Challenge inventory reservation failed; falling back to manual delivery.", error);
    return undefined;
  }
}

export async function fulfillPaidOrder(order: DBOrder, user: DBUser, platform = "MT5", gatewayRef?: string): Promise<DBTradingAccount | undefined> {
  const plan = await db.getPlanById(order.planId);
  if (!plan) {
    throw new Error("Challenge plan not found for this order.");
  }

  const accounts = await db.getAccounts();
  const existingAccount = accounts.find((a) => a.orderId === order.id && a.phase === "Phase 1 (Evaluation)");
  if (existingAccount) return existingAccount;

  if (order.status.toLowerCase() !== "pending") {
    return undefined;
  }

  order.status = "Paid";
  order.gatewayRef = gatewayRef || order.gatewayRef;
  order.updatedAt = new Date().toISOString();
  await db.saveOrder(order);

  await db.saveAuditLog({
    id: "log-" + Math.random().toString(36).substring(2, 11),
    userId: user.id,
    userName: user.name,
    targetId: order.id,
    targetType: "order",
    action: "order_payment",
    description: `Trader completed payment of $${order.amountPaid} for Order ${order.id} (${plan.name})`,
    createdAt: new Date().toISOString(),
  });

  const accountId = Math.floor(100000 + Math.random() * 900000).toString();
  const challengeRule = getChallengeRule(plan.name);
  const isInstant = challengeRule.key === "instant_funding";
  const reservedAccount = await reserveInventoryAccount(order, platform, plan.size);
  const newAccount: DBTradingAccount = {
    id: reservedAccount?.login || accountId,
    userId: order.userId,
    orderId: order.id,
    platform: (reservedAccount?.platform || platform || "MT5") as any,
    login: reservedAccount?.login || accountId,
    passwordMaster: reservedAccount?.password || "GENERATED_MASTER_PASS",
    passwordInvestor: reservedAccount?.password || "GENERATED_INVEST_PASS",
    server: reservedAccount?.server || "Range4ex-PendingServer",
    profitTarget: plan.size * (challengeRule.phase1TargetPercent / 100),
    balance: plan.size,
    equity: plan.size,
    todayPl: 0,
    totalPl: 0,
    status: isInstant ? "Funded" : "Active",
    phase: isInstant ? "Funded (Live)" : "Phase 1 (Evaluation)",
    graphLink: "",
    weekendHoldingAddon: Boolean(order.weekendHoldingAddon),
    externalStatisticsId: reservedAccount?.externalStatisticsId || "",
    statisticsApiId: reservedAccount?.externalStatisticsId || "",
    deliveryStatus: reservedAccount ? "delivered" : "pending",
    deliveredAt: reservedAccount ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
  };

  await db.saveAccount(newAccount);

  // Live BOGO offers apply automatically (no code); never block the paid account.
  try {
    await grantBogoOffersForOrder(order, plan);
  } catch (offerError) {
    console.warn("BOGO offer grant skipped:", offerError);
  }

  // This runs alongside, but independently of, the existing affiliate program.
  await recordCollaboratorSale(order, user);

  if (order.referralBalanceApplied && order.referralBalanceApplied > 0) {
    const userReferrals = (await db.getReferrals()).filter((r) => r.affiliateId === order.userId && r.status === "approved");
    let remainingToPay = order.referralBalanceApplied;
    for (const ref of userReferrals) {
      if (remainingToPay <= 0) break;
      await db.updateReferralStatus(ref.referredUserId, ref.orderId, "paid");
      remainingToPay -= ref.commissionAmount;
    }
  }

  const referrals = await db.getReferrals();
  const linkedRef = referrals.find((r) => r.orderId === order.id);
  if (linkedRef) {
    await db.updateReferralStatus(order.userId, order.id, "approved");
    await db.saveNotification({
      id: "notif-" + Math.random().toString(36).substring(2, 11),
      userId: linkedRef.affiliateId,
      title: "Referral Commission Earned",
      message: `Your referral link generated a new sale! $${linkedRef.commissionAmount} has been credited to your balance (pending payout).`,
      type: "success",
      channel: "email",
      status: "sent",
      read: false,
      sentAt: new Date().toISOString(),
    });
  } else if (user.referredBy) {
    const commissionAmount = Number((order.amountPaid * 0.05).toFixed(2));
    await db.saveReferral({
      referredUserId: order.userId,
      affiliateId: user.referredBy,
      orderId: order.id,
      commissionAmount,
      status: "approved",
      createdAt: new Date().toISOString(),
    });
    await db.saveNotification({
      id: "notif-" + Math.random().toString(36).substring(2, 11),
      userId: user.referredBy,
      title: "Referral Commission Earned",
      message: `Your referral link generated a new sale! $${commissionAmount} has been credited to your balance (pending payout).`,
      type: "success",
      channel: "email",
      status: "sent",
      read: false,
      sentAt: new Date().toISOString(),
    });
  }

  await db.saveNotification({
    id: "notif-" + Math.random().toString(36).substring(2, 11),
    userId: user.id,
    title: "Payment Received",
    message: reservedAccount
      ? `Thank you! Your purchase is complete and your trading account is ready. Order ID: ${order.id} | Plan: ${plan.name} | Amount: $${Number(order.amountPaid).toFixed(2)} | Status: Paid and delivered | Platform: ${newAccount.platform} | Login: ${newAccount.login} | Server: ${newAccount.server} | Master Password: ${newAccount.passwordMaster}.`
      : `Thank you! Your purchase is complete. Order ID: ${order.id} | Plan: ${plan.name} | Amount: $${Number(order.amountPaid).toFixed(2)} | Status: Paid — account provisioning in progress. Your credentials will be sent in a separate delivery email.`,
    type: "success",
    channel: "email",
    status: "sent",
    read: false,
    sentAt: new Date().toISOString(),
  });

  await db.saveNotification({
    id: "notif-" + Math.random().toString(36).substring(2, 11),
    userId: user.id,
    title: reservedAccount ? "Challenge Account Delivered" : "Account Provisioning Queued",
    message: reservedAccount
      ? `Your ${plan.name} ${newAccount.platform} account for $${Number(plan.size).toLocaleString()} is ready inside your dashboard.`
      : `Your ${plan.name} trading account is currently being provisioned. Credentials will be delivered shortly.`,
    type: reservedAccount ? "success" : "info",
    channel: "in_app",
    status: "sent",
    read: false,
    sentAt: new Date().toISOString(),
  });

  return newAccount;
}
