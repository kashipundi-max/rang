# Prop-Firm Rule Consistency Audit

Audit date: 2026-07-27  
Scope: repository source, checked-in SQL/schema/seeds, translations, UI, API routes, services, admin surfaces, notifications, checkout, and documentation. Application code was not modified.

## 0. Repository-wide rule location inventory

The complete repository was scanned before comparison. Material rule-bearing locations are:

- Canonical-looking configuration: `src/lib/rulebook.ts`.
- Published rulebook and FAQ: `src/features/rules/RulesPageContent.tsx`, `src/features/home/FaqSection/config/data.ts`, `messages/home/{en,es,el,ar}.json`, `messages/legal/{en,es,el}.json`.
- Public pricing remnants: `src/features/pricing/**`, `messages/pricing/{en,es,el}.json`, `src/features/home/PricesSection/**`.
- Trader dashboard: `src/features/dashboard/index.tsx`, `components/tabs/{OverviewTab,RulesTab,AccountsTab,PayoutsTab,BuyChallengeTab,PerformanceTab,AccountGraphModal}.tsx`.
- Admin dashboard: `src/features/dashboard/components/tabs/AdminCrmTab.tsx`.
- Enforcement and statistics ingestion: `src/lib/accountCompliance.ts`, `src/lib/accountStatistics.ts`, `src/lib/kycEligibility.ts`.
- Account lifecycle and fulfillment: `src/lib/orderFulfillment.ts`, `src/app/api/accounts/route.ts`, `src/app/api/accounts/request-next/route.ts`, `src/app/api/orders/route.ts`.
- Payout/KYC APIs: `src/app/api/payouts/route.ts`, `src/app/api/kyc/route.ts`, `src/app/api/kyc/didit-webhook/route.ts`.
- Catalog, inventory, coupons, checkout: `src/app/api/{plans,pricing-plans,challenge-inventory,coupons}/route.ts`, `src/app/api/orders/pay/**`, `src/config/payments.ts`, `src/lib/payments.ts`.
- Database definitions and checked-in data: `src/lib/db.ts`, `src/lib/db.json`, `src/lib/supabase_schema.sql`, `src/lib/*_migration.sql`.
- Email/notification surfaces: `src/lib/emailTemplates.ts`, `src/app/api/notifications/route.ts`, notification creation in account/order/payout routes.

No test or spec files exist. No repository CMS export, cron job, Edge Function, trading-platform risk configuration, or formal rule-version history was found.

Not accessible in this audit: the live Supabase contents and policies, live MT4/MT5/cTrader configuration, ShowMyTrades response contract/history, payment-provider dashboards, live email delivery logs, and any external CMS/help centre. Therefore checked-in database values are reported as repository database values, not claimed as the live production state.

## 1. Executive summary

Fifty-eight distinct rule/control dimensions were checked. Because one dimension can fail in more than one layer, category totals are non-exclusive.

| Result | Count |
|---|---:|
| Fully matched across every available layer | 7 |
| Numeric/conditional/wording mismatches | 14 |
| Published rules with missing implementation/data | 18 |
| Ambiguous rules or unverifiable upstream semantics | 9 |
| Unenforced published rules | 17 |
| Incorrectly enforced rules | 8 |
| Hardcoded or duplicated rule/value sites | 23 |
| Possible edge-case bugs | 11 |

Critical production risks:

1. Direct Skills catalog rows normalize to Two-Step Standard because `"Direct Skills"` is not an alias. Accounts can receive 8%/5%, 5%/10% rules instead of no target, 3%/5%.
2. Every passed Phase 1 account is moved to Phase 2. One-Step should move directly to funded/performance, but the lifecycle does not branch by program.
3. One-Step trailing drawdown compares the amount below the floor to the full drawdown allowance a second time. A $100K account with a $105K high-water mark should breach at $99K but code does not breach until $93K.
4. Daily drawdown is enforced from `todayPl`, not from the higher reset balance/equity baseline. Reset time, carried floating P/L, commissions, swaps, and timezone are not implemented.
5. Payout UI treats the requested amount as the trader's 80% share; backend treats it as gross profit and splits it again. The trader can receive 64% while the full request is deducted from balance.
6. Payout backend guesses initial size as $50K or $100K. $5K/$10K/$25K/$200K accounts are materially wrong.
7. Best-day, payout cadence, first-payout trading days, 2% on-demand threshold, open-position closure, news, weekend, trade-duration, prohibited-strategy, inactivity, scaling, refund, and jurisdiction rules are disclosed but not enforced.
8. Terms state universal 5% daily/10% maximum drawdown, contradicting One-Step, Two-Step Plus, and Direct Skills.

## 2. Critical mismatches

### C-01 — Direct Skills silently becomes Two-Step Standard

- Source: `src/lib/rulebook.ts:89-123`, `src/lib/db.ts:280-292`, `src/features/dashboard/components/tabs/BuyChallengeTab.tsx:49-50,179-184`.
- Current: `buyLabel` is `Direct Skills`; aliases only contain `INSTANT` and `INSTANT FUNDING`; unmatched values default to `two_step_standard`.
- Effect: UI features and dynamically materialized database plans can use 8%/5% targets and 5%/10% drawdown instead of 0%, 3%/5%.
- Status: INCORRECTLY ENFORCED. Severity: Critical.

### C-02 — One-Step receives an unauthorized Phase 2

- Source: `src/app/api/accounts/route.ts:331-405`, `src/app/api/accounts/request-next/route.ts:40-84`, `src/lib/orderFulfillment.ts:67-84`.
- Current: all non-instant paid orders start in Phase 1; every passed Phase 1 creates Phase 2 without checking plan type.
- Published: One-Step Pro has one evaluation phase (`RulesPageContent.tsx:105-108,134-137`).
- Effect: delayed funding, unexpected 0% Phase 2 target for One-Step, payout disputes.
- Status: INCORRECTLY ENFORCED. Severity: Critical.

### C-03 — Trailing drawdown floor is applied twice

- Source: `src/lib/accountCompliance.ts:57-65,76-88`.
- Current formula: `loss = max(0, floor - equity)` and breach only when `loss >= maxDrawdown`.
- Correct comparison: breach when `equity <= floor` (subject to the official equality decision).
- It also reconstructs high-water as only `max(initial,current balance,current equity)`, losing a prior peak.
- Status: INCORRECTLY ENFORCED. Severity: Critical.

### C-04 — Daily loss formula does not implement the published rule

- Source: published baseline at `RulesPageContent.tsx:157-160`; code at `accountCompliance.ts:79-88`; ingestion at `accountStatistics.ts:116-133`.
- Current: `currentDailyLoss = max(0,-todayPl)` from a third-party `period_returns.today.profit` field.
- Missing: 00:00 server snapshot, higher-of-balance/equity baseline, carried floating loss, reset timezone/DST, commission/swap treatment.
- Status: INCORRECTLY ENFORCED. Severity: Critical.

### C-05 — Payout is split twice and account size is guessed

- Source: `PayoutsTab.tsx:33-38,48-53`; `api/payouts/route.ts:69-106,160-166`.
- Current: UI maximum is `totalPl * 0.8`; backend then pays 80% of the submitted value and deducts the full submitted value. Backend guesses initial size using `balance > 90000 ? 100000 : 50000`.
- Status: INCORRECTLY ENFORCED. Severity: Critical.

### C-06 — Checkout/catalog permits rule identity drift

- Source: `api/pricing-plans/route.ts:37-50`, `db.ts:276-293`, `pricing_plans_migration.sql:2-8`.
- Catalog stores only model/size/price/status and recomputes rules from mutable code later. Orders are not pinned to a rule version/snapshot.
- Status: POSSIBLE EDGE-CASE BUG. Severity: Critical.

### C-07 — Checked-in DB seeds conflict with published plans

- `supabase_schema.sql:246`: Instant Funding is 5%/10%; published Direct Skills is 3%/5%.
- `supabase_schema.sql:261`: One-Step is 4%/8%; published One-Step is 4%/6%.
- Equivalent conflicts exist in `src/lib/db.json:225-233` for Instant Funding.
- Status: MISMATCH/OUTDATED. Severity: High to Critical if seeded or active.

## 3. Complete rule matrix

“All sizes” means the rule is percentage-based; repository sizes observed are $5K, $10K, $25K, $50K, $100K, and $200K in admin, while checked-in challenge seeds cover $10K/$25K/$50K/$100K only.

| Rule | Account type / phase / size | Expected-primary | Frontend | Backend | DB/admin/email/terms | Formula / TZ | Source | Status | Sev. | Correction |
|---|---|---|---|---|---|---|---|---|---|---|
| P1 target | Two-Step Standard / P1 / all | 8% | 8% | 8% | seed 8%; terms silent | initial size × .08 | `rulebook.ts:26`; rules `:134`; schema `:249` | MATCH | — | Version it |
| P2 target | Two-Step Standard / P2 / all | 5% | 5% | 5% | seed 5% | initial size × .05 | same sources | MATCH | — | Version it |
| Daily DD | Two-Step Standard / all | 5% | 5% | value 5%, wrong formula | seed/terms 5% | published reset baseline; code `-todayPl` | rules `:159-160`; compliance `:79-88` | INCORRECTLY ENFORCED | Critical | Implement snapshots |
| Overall DD | Two-Step Standard / all | 10% static equity floor | 10% static | approximates initial-size minus equity | seed/terms 10% | equity <= initial×.90 | rules `:172`; compliance `:65,75-88` | AMBIGUOUS | High | Store initial size; define equality |
| P1/P2 target | Two-Step Plus / all | 6% / 6% | published | config has 6/6 | not seeded; absent admin choices/buy list | initial × .06 | `rulebook.ts:43-60,111-115`; rules `:135` | MISSING | High | Add lifecycle/catalog or remove publication |
| DD | Two-Step Plus / all | 4% daily / 8% static | published | config only | no seed/admin selection | baseline/static | rules `:173`; `rulebook.ts:50-55` | MISSING | High | Add complete product |
| Weekend | Two-Step Plus / funded | allowed | published | value stored, not enforced | absent | n/a | rules `:273-274`; `rulebook.ts:55` | UNENFORCED | High | Platform/event enforcement |
| P1 target | One-Step / P1 / all | 10% | 10% | 10% | seed 10% | closed balance × .10 | `rulebook.ts:70`; schema `:261` | AMBIGUOUS | High | Verify upstream profit is closed/net |
| Phase count | One-Step / evaluation | one phase | one phase | creates Phase 2 | admin permits Phase 2 | n/a | rules `:105-108`; accounts route `:331-405` | INCORRECTLY ENFORCED | Critical | Branch on rule key |
| Daily DD | One-Step / all | 4% | 4% | value 4%, wrong daily formula | seed 4% | reset baseline | rules `:174`; compliance `:79-88` | INCORRECTLY ENFORCED | Critical | Snapshot engine |
| Overall DD | One-Step / all | 6% trailing, locks at +6% | 6% | flawed double allowance | seed says 8% | HWM−6%, then lock to initial | rules `:174,184-188`; schema `:261` | MISMATCH | Critical | Persist HWM and compare equity to floor |
| Target | Direct Skills / funded / all | none | sometimes shows Two-Step via alias bug | dynamic plans become Two-Step; “Instant” seeds funded | seed target 0 | 0 | `rulebook.ts:89-104,119-123`; fulfillment `:67-84` | INCORRECTLY ENFORCED | Critical | Stable enum, add alias, no text inference |
| DD | Direct Skills / all | 3% / 5% static | alias path can show 5%/10% | alias path enforces 5%/10% | Instant seed 5%/10% | static | rules `:175`; schema `:246` | MISMATCH | Critical | Migrate records and pin version |
| Evaluation min days | all evaluations | 3 per phase | rule pages 3; dashboard mock 5 | counts daily rows | DB no field | count days with opened+closed trade | rules `:199-204`; dashboard `index.tsx:134,180`; compliance `:43-46` | MISMATCH | High | Derive qualifying days explicitly |
| Funded first payout days | all funded | 5 first request; 0 later | rules say 5/0; Payout UI says 14 days | payout API ignores days; compliance always says 5 | no first-payout marker | distinct qualifying days | rules `:207-208,385`; payout UI `:121-128` | MISMATCH | Critical | Store payout-cycle state |
| Maximum trading period | all evaluation | unlimited | published | no expiry found | no expiry field | n/a | rules `:211-212` | MATCH | — | Add regression assertion |
| Daily reset | all | 00:00 server time | published | not implemented | no timezone/server calendar | unspecified TZ/DST | rules `:68-69,159-160`; RulesTab `:189-192` | MISSING | Critical | Define IANA TZ and snapshot job |
| Profit target basis | evaluation | closed-trade balance only | published | `accountStats.profit`/`totalPl`; upstream semantics unknown | no basis field | net realized? unknown | rules `:128`; stats `:129-133` | AMBIGUOUS | Critical | Contract/schema for realized net P/L |
| Exact limit | all | wording says “exceeding” | > implied | `>=` breaches | terms says exceeding | equality unresolved | rules `:322`; compliance `:87` | MISMATCH | High | Legal decision and tests |
| Commission/swaps | all DD/target | must be defined | silent | no explicit handling | silent | upstream-dependent | statistics/compliance | AMBIGUOUS | High | Define net P/L inclusions |
| Leverage | all / all | FX 1:100, exotics 1:50, metals 1:30 | shown | no provisioning enforcement | no DB fields | platform config inaccessible | rules `:229-239`; RulesTab `:40` | UNENFORCED | High | Store/integrate leverage profile |
| Instruments | all | Forex default; optional metals | published | no enforcement | no symbol allowlist | n/a | rules `:223-227` | AMBIGUOUS | High | Publish exact per-plan symbol set |
| Best-day | funded/on-demand | max 40%; not biweekly | displayed pending | payout API ignores | no data fields | best daily profit / cumulative profit | rules `:250-253`; payout route | UNENFORCED | Critical | Eligibility service |
| Min trade duration | all | ≥50% profit from >2m trades | published/pending | no enforcement | no fields | qualifying profit / total | rules `:257-260`; compliance `:118-123` | UNENFORCED | High | Trade-level audit |
| News window | all | ±2m high-impact; soft breach | published | no calendar/trade check | no event/violation tables | timezone unspecified | rules `:264-268`; compliance `:124-129` | UNENFORCED | High | Event-source + instrument mapping |
| Weekend holding | evaluation | allowed | published | no enforcement | no field | market-close definition absent | rules `:271-275` | UNENFORCED | High | Define cutoff and gap treatment |
| Weekend holding | Standard/One-Step funded | prohibited soft breach | published | no enforcement | boolean config unused | n/a | rulebook `:33,77`; rules `:274` | UNENFORCED | High | Position-close audit |
| EAs | all | personal limited; commercial prohibited | published | no detection | no disclosure record | qualitative | rules `:278-282` | UNENFORCED | Medium | Attestation + surveillance |
| Prohibited strategies | all | listed; soft then hard | published | no detection/escalation | no violation history | qualitative | rules `:285-301` | UNENFORCED | High | Versioned flags/case workflow |
| Consistent strategy | all phases | broadly consistent | published | boolean defaults true only | no metric/threshold | undefined | rules `:305-308`; dashboard `index.tsx:784-785` | AMBIGUOUS | High | Objective review policy |
| Hard-breach effects | all | close, liquidate, forfeit; no reopen | published | sets DB status Failed only | no liquidation integration | n/a | rules `:326-330`; compliance `:178-212` | UNENFORCED | Critical | Transactional platform action |
| Breach notice | all | automatic email with rule, timestamp, evidence | published | saves in-app notice; no evidence timestamp in body | channel in_app | n/a | rules `:346-347`; compliance `:139-171` | MISMATCH | High | Evidence bundle + real delivery |
| Appeal | all | within 5 business days | published | none | no case/SLA table | TZ/calendar absent | rules `:350-353` | UNENFORCED | Medium | Appeal workflow |
| Profit split | funded | 80/20 | displayed | hardcoded .8/.2 | config 80 but ignored; admin labels fixed | rounding to cents | rules `:369-370`; payout `:96-106` | DUPLICATE | High | Use account rule snapshot |
| Biweekly payout | funded | 14 days; $100 min; 5 days first | UI says 14; request enabled only if `>100` | API ignores all | no cycle fields | exactly $100 conflicts | rules `:380-387`; PayoutsTab `:38,121-128` | MISMATCH | Critical | Central eligibility transaction |
| On-demand payout | funded | ≥2% gross and 40% best-day | absent from request UI | API ignores | no schedule type | gross balance basis | rules `:386` | UNENFORCED | Critical | Require payout mode and checks |
| Open positions at payout | funded | all closed | published only | API ignores | no open-position snapshot | n/a | rules `:381`; payout route | UNENFORCED | Critical | Fresh platform check |
| Payout amount | funded/all sizes | eligible net under one defined convention | UI sends 80% share | backend splits again; guesses 50K/100K | no initial-size column | inconsistent | PayoutsTab `:37`; payout `:85-106` | INCORRECTLY ENFORCED | Critical | Store initial size; define gross/net request |
| KYC timing | funded | before first payout is released | UI/API require before request | request blocked | KYC table | earlier than disclosed | rules `:407-408`; payout `:48-55` | MISMATCH | Medium | Align wording or enforcement |
| Payout processing | funded | 2–5 business days | published | admin can mark any time/status | no SLA timestamps | business calendar absent | rules `:380-381` | UNENFORCED | Medium | SLA tracking |
| Scaling | funded | 10–25%, consecutive profitable cycles, cap “such as” $2M, discretionary | published ambiguously | none | no fields | undefined | rules `:373-377` | AMBIGUOUS | High | Finalize exact policy before code |
| Inactivity | all | 30 calendar days, irreversible | published | none | no last-trade/deactivation job | calendar days | rules `:403-405` | UNENFORCED | High | Scheduled control |
| VPN/IP/device | all | permitted legitimately; owner trades | published | no checks | no device/IP policy data | qualitative | rules `:411-415` | UNENFORCED | Medium | Risk review, not auto-breach |
| Account sharing | all | hard breach | published | no detection | no case fields | qualitative | rules `:418-419` | UNENFORCED | High | Evidence-based workflow |
| Jurisdictions | purchase/funded | restricted list to be published | list explicitly unfinished | checkout has no geo/sanctions gate found | no country list | n/a | rules `:422-423` | MISSING | Critical | Publish/version and enforce |
| Fee refund | Two-/One-Step first payout | refundable, “subject to model” | published conditionally | no refund trigger | payment data only | undefined amount/timing | rules `:426-430` | AMBIGUOUS | High | Finalize and automate |
| Direct fee refund | Direct Skills | non-refundable | published | no explicit restriction/workflow | absent | n/a | rules `:429` | UNENFORCED | Medium | Encode rule snapshot |
| Rule changes | existing accounts | non-retroactive | published | mutable global config applies on every evaluation | no rule version per order/account | current code at evaluation time | rules `:433-436`; compliance `:70` | INCORRECTLY ENFORCED | Critical | Immutable rule snapshot/version |
| Account sizes | catalog/admin | exact available sizes | dynamic catalog; admin offers 5/10/25/50/100/200K | payout handles only 50/100K | seeds only 10/25/50/100K | percentage rules | Admin `:354`; schema `:245-264`; payout `:85` | MISMATCH | Critical | One size catalog + initial size FK |
| Prices | challenges | official value undetermined | public `/pricing` still SaaS $29/$79/$199 | checkout uses DB catalog | seeds $99/$189/$299/$499/$500/$749; admin default $449 | cents/round-up | pricing config; schema `:246-264`; Admin `:198-202` | OUTDATED | High | Remove legacy pricing; snapshot price |
| Discounts | checkout | active DB coupon | UI/API match live coupon; both retain LUNAR10/SARAH10 fallback | hardcoded 10%; affiliate 10%; ceil | coupon DB + fallbacks | `ceil(base-discount)` | BuyChallenge `:234-246`; orders `:112-138` | HARDCODED | Medium | DB-only promotions, explicit rounding |
| Two-Step Plus purchase | product/catalog | published product | absent | rejected/excluded | not in buy/admin list | n/a | `rulebook.ts:111-115`; pricing API `:37-40` | MISSING | High | Add or unpublish |
| Arabic legal/pricing | Arabic users | equivalent disclosures | files absent | n/a | fallback behavior unknown | n/a | `messages/` inventory | MISSING | Medium | Add reviewed translations |
| Live rule DB | all | exact production values | n/a | n/a | inaccessible | n/a | external | AMBIGUOUS | High | Export and compare before release |
| Regression tests | all | every rule/boundary | none | none | none | n/a | repository scan | MISSING | Critical | Implement plan below |

## 4. File-level findings

The critical items above contain the primary file-level evidence. Additional high-value file findings:

- `src/lib/rulebook.ts:111-115`: Two-Step Plus exists in rules but is deliberately omitted from purchasable types.
- `src/app/api/pricing-plans/route.ts:37-40`: error says “Instant” although the accepted label is “Direct Skills”; exact wording and API contract disagree.
- `src/lib/orderFulfillment.ts:43`: idempotency only recognizes Phase 1. Direct funded accounts are not recognized by this guard and model identity relies on text at line 67.
- `src/app/api/accounts/route.ts:159-165`: admin-created accounts default to $100K, $8K target, Phase 1 regardless of selected product; `Number(balance) || 100000` also replaces an intentional zero.
- `src/app/api/accounts/route.ts:222-226`: admin can change target, balance, equity, phase independently of the governing rule without a rule-snapshot consistency check.
- `src/features/dashboard/index.tsx:758-786`: missing server values fall back to size from current balance, type inferred from size, 5%/10% limits, and `consistencyRule/newsRule=true`. These defaults can display the wrong product and rules.
- `src/features/dashboard/index.tsx:116-183`: mock evaluation accounts show five minimum days, contradicting three.
- `src/features/rules/RulesPageContent.tsx:451-460`: quick-reference omits Two-Step Plus although earlier sections publish it.
- `messages/legal/en.json` Drawdown & Risk Breaches section: universal 5%/10% termination statement is only correct for Two-Step Standard.
- `src/lib/pricing_plans_migration.sql:20-21`: RLS policy `FOR ALL USING (true)` allows any role with table privileges to mutate plan price/model/status directly. App-level admin checks do not protect the Data API. Severity: Critical security/financial risk.
- `src/lib/supabase_schema.sql:247-265`: conflict updates omit all rule columns, so rerunning the seed does not repair stale profit/drawdown/split values.
- `src/app/api/payouts/route.ts:142-158`: accepts arbitrary payout status strings from admins; type constraints exist only in TypeScript, not runtime validation.
- `src/app/api/payouts/route.ts:160-166`: repeated `paid` updates can deduct the payout repeatedly; there is no idempotency/previous-status guard. Severity: Critical edge-case financial risk.
- `src/lib/accountStatistics.ts:95-113`: failed/stale statistics are saved, but compliance can continue using old balance/equity/P&L with no stale-data fail-safe.

## 5. Calculation findings

### Daily loss

Published example: $100,000 account, reset balance $101,000, reset equity $99,000, 5% limit. The higher baseline is $101,000; floor is $96,000. Equity of $96,000 is exactly at the boundary, $96,000.01 is $0.01 above, and $95,999.99 is $0.01 below. Code cannot reproduce this because it only checks `-todayPl` against $5,000 and stores no reset snapshot.

### Static maximum drawdown

Expected Two-Step $100K floor: $90,000. Code approximates loss as `100000 - current equity` when plan context is present. If plan lookup is missing, it sets “size” to current balance; a reduced balance shrinks both the reference and allowance and can change the outcome. Equality is also unresolved: code breaches at exactly $90,000 while public wording says “exceeding.”

### One-Step trailing drawdown

At $100K initial, $105K historical HWM and 6% allowance, floor is $99K. Expected breach boundary is equity at/below $99K per final policy. Code calculates `floor-equity`, then waits for that number to reach another $6K; it breaches at $93K. At the +6% lock milestone, expected floor is $100K; code waits until $94K. A later fall also erases the true HWM because no historical HWM is stored.

### Profit target

Published target counts closed balance only. Code passes on `account.totalPl >= target`, populated from third-party `account_stats.profit`. The contract does not prove whether this includes open equity, commissions, swaps, deposits, or manual adjustments. A $100K Two-Step account showing $8K open profit could therefore pass if upstream `profit` includes it.

### Trading days

Published: a day counts when at least one position is opened and closed that day. Code counts the number of `daily_performance` rows. A zero-trade calendar row can count; multiple absent rows can undercount; a cross-midnight trade cannot be classified correctly without trade timestamps and server timezone.

### Payout

For a $50K funded account with $1,900 profit, UI shows $1,520 eligible (80%). If the trader submits $1,520, backend records trader share $1,216 and firm share $304, then deducts $1,520 from balance. This is an effective 64% trader share. For a $25K account at $26K, backend assumes a $50K threshold and reports no profit. For a $200K account at $201K, it assumes $100K and reports $101K profit.

Rounding is inconsistent: checkout rounds final price upward to whole dollars with `Math.ceil`; payout split rounds to cents; rule breach comparisons use JavaScript floating-point without integer cents/ticks or tolerance. Manual balance/equity adjustments immediately affect enforcement and payout without adjustment classification.

## 6. Missing enforcement

Best-day; minimum trade duration; news window; weekend holding; EA provenance; martingale/grid/arbitrage/copy/hedging/one-sided/reversal strategy rules; consistent strategy; position liquidation; profit forfeiture; appeal deadline; leverage; symbol restrictions; first and later payout cadence; exact $100 minimum; 2% on-demand minimum; closed-position requirement; payout cap choice; scaling; inactivity; account sharing; jurisdiction/sanctions; fee refund; non-retroactivity; timezone/DST; commission/swap treatment; deposit/withdrawal/manual-adjustment exclusions.

## 7. Hidden enforcement

- KYC is required before payout request, while disclosure says before release.
- Equality at the daily/overall boundary is treated as a breach (`>=`) although disclosure says “exceeding.”
- One-Step is forced through Phase 2.
- Direct Skills may receive Two-Step rules through fallback normalization.
- Payout eligibility uses an undocumented 50K/100K size heuristic and a second 80% split.
- Admin or missing-data fallbacks silently impose $100K, 8% target, 5% daily, 10% overall, Two-Step identity.

## 8. Recommended single source of truth

Use immutable, versioned rule snapshots, not only a mutable global constant:

```ts
type RuleVersion = {
  id: string;                 // e.g. one_step_pro@2026-08-01
  program: "two_step_standard" | "two_step_plus" | "one_step_pro" | "direct_skills";
  phases: PhaseRule[];
  sizes: { amountCents: bigint; priceCents: bigint; currency: string }[];
  timezone: string;           // IANA name
  dailyLoss: { percentBps: number; basis: "higher_reset_balance_equity"; breachAtEquality: boolean };
  overallLoss: { percentBps: number; model: "static" | "trailing_lock"; basis: "equity"; lockBps?: number };
  payout: PayoutRule;
  conductPolicyId: string;
  effectiveAt: string;
};
```

Every order and account should store `ruleVersionId`, `initialBalanceCents`, and a serialized/hash-verified rule snapshot. Persist daily reset snapshots, historical HWM, trade-day events, adjustment classifications, payout-cycle state, and violation cases. Trading platform provisioning, UI, email, admin, and payout review must read the account snapshot. Only new purchases receive a new version.

## 9. Recommended fixes

Critical:

1. Freeze automated pass/breach/payout actions until Direct Skills normalization, One-Step transitions, trailing drawdown, daily snapshots, and payout arithmetic are corrected and replay-tested.
2. Add stable enum IDs; never infer program from display text, account size, server name, or plan ID substring.
3. Store initial size/HWM/reset snapshots and implement one transactional eligibility service using integer cents/basis points.
4. Make payout requests idempotent; define request as gross or net exactly once; validate prior status before deduction.
5. Snapshot rule version on purchase and enforce non-retroactivity.
6. Replace permissive pricing-plan RLS with admin authorization and `WITH CHECK`; audit all exposed tables/policies.

High:

1. Decide whether Two-Step Plus is real; either implement every layer or remove all publication.
2. Migrate conflicting seed/live plan rows and make seed conflict updates include rule fields.
3. Build enforcement for payout, news/weekend/conduct, inactivity, refunds, and jurisdiction controls.
4. Define equality, net P/L components, server timezone/DST, weekend cutoff, and exact scaling/refund terms with Legal/Compliance sign-off.
5. Block automatic decisions on stale/unmatched statistics payloads.

Medium:

1. Remove SaaS-template pricing ($29/$79/$199) from public prop-firm routes.
2. Remove coupon fallbacks and document whole-dollar checkout rounding.
3. Add Arabic legal/pricing content and professional review for all translations.
4. Add structured appeal, breach-evidence, and actual email delivery records.

Low:

1. Standardize “daily loss” vs “daily drawdown,” “maximum loss” vs “overall drawdown,” and “Performance Stage” vs “Funded (Live).”
2. Correct grammar (“a advanced,” “trader own”) and remove provisional legal wording such as “such as $2,000,000” and “final country list should be published.”

## 10. Regression test plan

- Unit: normalization for every enum/alias/display label; phase target/minimum-day lookup; static/trailing floors; HWM lock; equality and ±$0.01; cents/bps rounding; coupon expiry/rounding; payout gross/net split.
- Property tests: all supported programs × phases × sizes ($5K/$10K/$25K/$50K/$100K/$200K) and random equity paths; invariants that larger losses never un-breach and HWM never falls.
- Integration: purchase → rule snapshot → provisioning → statistics → pass/breach → next phase/funded → payout → scaling/refund. Explicitly assert One-Step skips Phase 2 and Direct Skills begins funded.
- API: authorization, runtime enum validation, idempotent webhooks/payout status, repeated paid update, stale stats, missing plan, inactive catalog, coupon exact expiry, KYC request/release timing.
- Database: constraints for program/phase/status, initial size, rule version, money precision, unique payout idempotency key; RLS owner/admin tests; seed-vs-rule snapshot comparison.
- Frontend: public rulebook, FAQ, legal, buy modal, checkout, dashboard, admin, email text all render from the same snapshot; locale parity; Two-Step Plus presence/absence decision.
- Breach boundaries: exact limit, ±$0.01, open-equity target, closed-balance target, commission/swap breach, trade across reset, weekend gap, manual adjustment, withdrawal, stale feed.
- Time: exact 00:00 server boundary, UTC offset, DST forward/back, business-day payout/appeal calendars.
- Payout: exactly $100, $99.99, $100.01; 2% exact/±$0.01; 40% exact/±$0.01; first vs subsequent payout; open positions; all sizes; simultaneous requests; repeated approval/paid event.
- Scaling/refund: exact number of profitable cycles, violation reset, min period, 10%/25% selected rule, cap boundary, balance-vs-buying-power definition, first successful payout refund exactly once.

## Audit conclusion

The repository does not currently support a defensible claim that published rules are consistently enforced. The safest release posture is to suspend automatic rule outcomes and payout deductions until the Critical group is corrected, live database/platform configurations are exported and compared, and the regression suite passes. No fixes were applied; approval is required before implementation.
