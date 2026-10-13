"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconArrowLeft,
  IconBook,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconClockHour4,
  IconFileDescription,
  IconGavel,
  IconListCheck,
  IconLock,
  IconScale,
  IconSearch,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";

type FaqItem = {
  question: string;
  answer: string[];
  list?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
};

type FaqSection = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  items: FaqItem[];
};

type ProgramKey = "two-step" | "one-step" | "instant";

type ProgramRulebook = {
  key: ProgramKey;
  name: string;
  description: string;
  articles: FaqItem[];
};

const sections: FaqSection[] = [
  {
    id: "definitions",
    eyebrow: "Section 1",
    title: "Definitions",
    description: "Core terms used throughout the evaluation and advanced simulated account rulebook.",
    items: [
      {
        question: "What is Account Balance?",
        answer: ["Account Balance is the ledger value of the account, excluding floating or unrealized profit and loss on open positions."],
      },
      {
        question: "What is Equity?",
        answer: ["Equity is Account Balance plus or minus floating profit or loss on open positions at a specific moment."],
      },
      {
        question: "What is the Evaluation or Challenge?",
        answer: ["The Evaluation, also called the Challenge, is the paid assessment stage a trader must pass before receiving an advanced simulated account."],
      },
      {
        question: "What is a Range4ex Performance Account?",
        answer: [
          "A Range4ex Performance Account is the advanced simulated account provided after a trader successfully completes the required Evaluation.",
          "The trader earns a Performance Fee, commonly called a payout, from eligible profits generated on the account.",
        ],
      },
      {
        question: "What is the Daily Reset?",
        answer: ["Daily Reset occurs at 00:00 UTC, when the daily loss counter returns to zero for the new trading day. Losses from the previous day do not carry into the new Daily Drawdown calculation."],
      },
      {
        question: "What is a Hard Breach?",
        answer: ["A Hard Breach is a rule violation that results in immediate account closure."],
      },
      {
        question: "What is a Soft Breach?",
        answer: [
          "A Soft Breach is a rule violation that removes the associated profit and/or creates a formal warning without closing the account.",
          "The account remains open unless the violation recurs, becomes severe, or Equity has also fallen below the Maximum Drawdown floor.",
        ],
      },
    ],
  },
  {
    id: "programs",
    eyebrow: "Sections 2-3",
    title: "Program Structure and Profit Targets",
    description: "Available account paths, evaluation stages, and target requirements.",
    items: [
      {
        question: "What trading programs are offered?",
        answer: [
          "Three account types are defined: Two Step, One Step, and Instant.",
          "All three programs are Forex-only and follow the leverage and instrument rules listed in this rulebook.",
        ],
      },
      {
        question: "How does the Two Step work?",
        answer: [
          "The Two Step is the flagship and recommended default program.",
          "It includes Phase 1 and Phase 2, each with its own profit target. It uses static drawdown for predictable risk planning and simple support.",
        ],
      },
      {
        question: "How does the One Step work?",
        answer: [
          "One Step is designed for experienced traders who want a faster assessment route.",
          "It has a single higher profit target and uses a static, balance-and-equity-based drawdown floor fixed from the initial account size.",
        ],
      },
      {
        question: "How does Instant work?",
        answer: [
          "Instant has no evaluation target. The trader begins in the Performance Stage immediately and must operate inside the risk-management rules from day one.",
          "Because the evaluation is skipped, Instant carries the highest entry fee and the tightest daily and overall drawdown limits.",
        ],
      },
      {
        question: "What are the profit targets for each plan?",
        answer: [
          "Profit targets apply during evaluation only and are calculated from the Initial Account Balance. Two Step requires 10% in Phase 1 and 5% in Phase 2; One Step requires 10% in its single evaluation phase. Instant Funded and Funded accounts have no evaluation profit target.",
          "Formula: Required Profit = Initial Account Balance x Profit Target Percentage. For example, a $100,000 Two Step account requires $10,000 in Phase 1 and $5,000 in Phase 2.",
          "Only closed-trade balance counts toward completion. Floating profit on open positions does not count. After all applicable profitable-day, drawdown, and conduct requirements are met, the account may advance to the next stage.",
          "Once a trader reaches the Performance Stage, no further profit target applies. Growth is unlimited and rewarded through the Performance Fee split.",
        ],
        table: {
          headers: ["Plan", "Phase 1", "Phase 2", "Performance Stage"],
          rows: [
            ["Two Step", "10%", "5%", "No target"],
            ["One Step", "10%", "-", "No target"],
            ["Instant", "-", "-", "No target"],
          ],
        },
      },
    ],
  },
  {
    id: "drawdown",
    eyebrow: "Section 4",
    title: "Drawdown Limits",
    description: "Daily and overall drawdown rules that apply during both evaluation and performance stages.",
    items: [
      {
        question: "What drawdown limits apply to every account?",
        answer: [
          "Two independent limits apply at all times: Daily Drawdown and Overall Drawdown.",
          "Breaching either limit is a Hard Breach during both evaluation and performance-stage activity.",
        ],
      },
      {
        question: "How is Daily Drawdown calculated?",
        answer: [
          "Daily Drawdown is the maximum loss permitted during one trading day, measured from 00:00 UTC through 23:59 UTC. The percentage is fixed from the Initial Account Balance and does not increase after profits.",
          "Formula: Daily Loss Limit = Initial Account Balance x Applicable Daily Percentage. Current Daily Loss = today's closed losses + current floating loss. Balance and Equity are monitored continuously, and the allowance resets at 00:00 UTC.",
          "Example: On a $100,000 One Step account, the 4% daily limit is $4,000. If today's closed loss is $1,500 and the current floating loss is $2,200, the daily loss is $3,700 and the account remains compliant. If it rises above $4,000, the account breaches the rule.",
          "Closed profit does not erase a separate floating loss when the live daily-loss calculation is performed. Traders should maintain a safety buffer because commissions, swaps, slippage, and rapid price movements can change Equity.",
        ],
        list: [
          "Two Step Evaluation: 5% daily limit.",
          "One Step Evaluation: 4% daily limit.",
          "Instant Funded: 3% daily limit.",
          "Funded Account: 4% daily limit.",
          "Exceeding the applicable daily limit is a Hard Breach.",
        ],
      },
      {
        question: "How is Overall Drawdown calculated?",
        answer: [
          "Maximum Overall Loss is the maximum loss permitted over the entire lifetime of the account. It is static, never resets, and never increases after the account earns profit.",
          "Formula: Overall Loss Limit = Initial Account Balance x Applicable Overall Percentage. Current Overall Loss = Initial Account Balance - the lower of current Balance or Equity. The account floor equals Initial Account Balance - Overall Loss Limit.",
          "Example: A $100,000 Funded account has a 10% overall limit and a $90,000 floor. If Balance is $92,000 but Equity falls to $89,500, the lower value is $89,500 and the overall loss is $10,500, so the account is in breach.",
          "Both closed losses and floating losses can trigger the rule because the lower of Balance and Equity is used. Exceeding the applicable limit is a Hard Breach and the allowance is not restored by a new day.",
        ],
        table: {
          headers: ["Plan", "Daily Drawdown", "Overall Drawdown", "Model"],
          rows: [
            ["Two Step", "5%", "10%", "Static, balance/equity-based"],
            ["One Step", "4%", "10%", "Static, balance/equity-based"],
            ["Instant", "3%", "6%", "Static, balance/equity-based"],
            ["Funded Stage", "4%", "10%", "Static, balance/equity-based"],
          ],
        },
      },
      {
        question: "What is static drawdown?",
        answer: ["Static drawdown means the breach floor never moves. It is calculated from the initial account balance, and a breach occurs when either Balance or Equity falls below that fixed floor."],
      },
    ],
  },
  {
    id: "trading-days",
    eyebrow: "Section 5",
    title: "Profitable Trading Days and Time Limits",
    description: "Minimum activity requirements and the absence of maximum challenge deadlines.",
    items: [
      {
        question: "What is the Minimum Profitable Trading Days rule?",
        answer: [
          "Where this activity requirement applies, account completion or payout eligibility requires at least 3 profitable trading days. Each qualifying day must finish with net closed profit of at least 0.5% of the Initial Account Balance.",
          "Formula: Minimum Profit Per Qualifying Day = Initial Account Balance x 0.5%. On a $100,000 account, each qualifying day must therefore produce at least $500 in final net closed profit.",
          "A day's final result is measured after all positions counted for that trading day are closed. Multiple trades may combine to reach the threshold, but earning more than 0.5% in one day still counts as only one profitable day.",
          "Losing, break-even, and sub-threshold days do not count. They do not erase previously completed qualifying days unless another trading rule is breached.",
        ],
        table: {
          headers: ["Example on $100,000", "Daily Result", "Counts?", "Outcome"],
          rows: [
            ["Monday / Tuesday / Wednesday", "$650 / $520 / $840", "Yes / Yes / Yes", "Requirement met"],
            ["Monday / Tuesday / Wednesday", "$450 / $700 / $900", "No / Yes / Yes", "Only 2 days - not met"],
            ["Monday / Tuesday / Wednesday / Thursday", "$600 / -$350 / $750 / $550", "Yes / No / Yes / Yes", "Requirement met"],
          ],
        },
      },
      {
        question: "What counts as a profitable trading day?",
        answer: ["The final net closed result for the day must be at least 0.5% of the Initial Account Balance. Multiple trades may combine to reach the threshold; losing, break-even, and sub-threshold days do not count, and a larger result still counts as one day."],
      },
      {
        question: "What is the funded-stage minimum before a payout?",
        answer: ["A payout requires 3 qualifying profitable trading days, each reaching at least 0.5% of the Initial Account Balance, together with every other applicable payout rule."],
      },
      {
        question: "Is there a maximum time limit?",
        answer: ["No. There is no maximum time limit on any phase. Traders may take as long as needed to reach the target, provided the account has not breached a rule."],
      },
    ],
  },
  {
    id: "leverage",
    eyebrow: "Section 6",
    title: "Leverage and Instruments",
    description: "Approved instrument classes and leverage by market type.",
    items: [
      {
        question: "Which instruments are covered by the rulebook?",
        answer: [
          "The program is Forex-only by default.",
          "Gold and Silver are available only when they appear in the Range4ex platform instrument list for the account.",
        ],
        table: {
          headers: ["Instrument Class", "Leverage"],
          rows: [
            ["Major and Minor FX Pairs", "1:100"],
            ["Exotic FX Pairs", "1:50"],
            ["Gold and Silver, if offered", "1:30"],
          ],
        },
      },
      {
        question: "Does leverage change after evaluation?",
        answer: ["No. Leverage is identical across Evaluation and Performance stages so the trader does not need to change trading behavior between stages."],
      },
    ],
  },
  {
    id: "conduct",
    eyebrow: "Section 7",
    title: "Trading Conduct Rules",
    description: "Professional conduct standards designed to prevent abusive or non-replicable trading behavior.",
    items: [
      {
        question: "What is the Best Day Rule?",
        answer: [
          "For on-demand payouts, no single trading day may account for more than 40% of total cumulative account profit.",
          "This rule does not restrict trading itself. It only affects the timing of an on-demand payout request, and it does not apply to the fixed bi-weekly payout schedule.",
        ],
      },
      {
        question: "What is the Profit Consistency Rule (30%)?",
        answer: [
          "This rule applies to Instant Funded and Direct Funded accounts. No single trading day's profit may account for more than 30% of the account's total profit.",
          "Formula: Consistency Ratio = (Largest Single Day's Profit / Total Account Profit) x 100. If the ratio is above 30% the rule is violated; 30% or less is compliant (exactly 30% passes).",
          "A single day is one calendar day, grouped by the same 00:00 UTC daily reset used for drawdown. The largest single day is the most profitable day by net P&L. Total account profit is the sum of every day's net P&L, so losing days reduce the total.",
          "Example: Sep 8 = $80.00, Sep 9 = $237.50, Sep 10 = $329.55. Total = $647.05, largest day = $329.55, ratio = 329.55 / 647.05 = 50.9%, which exceeds 30% and violates the rule.",
          "The rule is designed to reward repeatable performance and prevent one oversized day from determining the payout result. It is separate from the 40% Best Day Rule and all drawdown requirements.",
          "If the ratio is above 30%, the rule is violated. This is a hard breach: the account fails.",
        ],
        table: {
          headers: ["Total Account Profit", "Largest Single Day", "Ratio", "Result"],
          rows: [
            ["$6,000", "$1,800", "30%", "Compliant"],
            ["$6,000", "$2,000", "33.33%", "Violated"],
            ["$647.05", "$329.55", "50.93%", "Violated"],
            ["$20,000", "$6,800", "34%", "Violated"],
          ],
        },
      },
      {
        question: "What is the Minimum Holding Time rule?",
        answer: [
          "This rule applies to every trade on Instant Funded accounts and all Funded phases. Each individual trade must remain open for at least 3 minutes (180 seconds), measured from its opening time to its closing time.",
          "A partial closure does not bypass the rule; any prohibited closure before 180 seconds is recorded against the trade. The requirement applies regardless of instrument, lot size, or strategy.",
          "There is no warning or relaxation. The first trade closed in under 3 minutes causes an immediate account breach and failure.",
          "Trading activity and hold durations are monitored from the platform's order records. Repeated attempts to circumvent the rule may also be reviewed by Risk Management.",
        ],
        table: {
          headers: ["Trade History", "Holding Time", "Result"],
          rows: [
            ["Single trade", "3 minutes 10 seconds", "Compliant"],
            ["First short-held trade", "2 minutes 30 seconds", "Account breach"],
            ["49 compliant trades plus one short-held trade", "2 minutes 50 seconds on one trade", "Account breach"],
          ],
        },
      },
      {
        question: "What is the Trade Layering rule?",
        answer: [
          "This rule applies to Instant Funded and Funded accounts. A Trade Layering violation occurs only when 2 or more trades are opened on the same instrument, in the same direction, and less than 5 minutes apart. All three conditions must be present.",
          "Once a trade opens, another trade on that same instrument and in that same direction must wait until 5 full minutes have elapsed. Exactly 5 minutes or more is allowed. A different instrument or the opposite direction is also allowed.",
          "The waiting period is measured from the previous trade's opening time. Closing that trade, partially or fully, does not reset or shorten the 5-minute period.",
          "Range4EX may review opening times, instruments, direction, order history, trading patterns, and other relevant records. A confirmed violation may cause compliance review, payout delay or rejection, removal of associated profit, or account suspension or termination in repeated or serious cases.",
        ],
        table: {
          headers: ["Trade Sequence", "Time Gap", "Result"],
          rows: [
            ["EUR/USD Buy, then EUR/USD Buy", "3 minutes 45 seconds", "Violation"],
            ["EUR/USD Buy, then EUR/USD Buy", "5 minutes 10 seconds", "Allowed"],
            ["XAU/USD Buy, then XAU/USD Sell", "2 minutes", "Allowed - opposite direction"],
            ["EUR/USD Buy, then GBP/USD Buy", "1 minute 30 seconds", "Allowed - different instrument"],
            ["EUR/USD Buy, close it, then Buy again", "4 minutes from first opening", "Violation - closing does not reset time"],
          ],
        },
      },
      {
        question: "Is News Trading allowed?",
        answer: [
          "During the Step 1, Step 2 and One Step evaluation phases news trading is unrestricted.",
          "On Instant Funded and all Funded accounts a restricted window applies around every high-impact (\"red folder\") economic-calendar release for USD, EUR, GBP, JPY, CHF, CAD, AUD and NZD — for example NFP, CPI, FOMC, central-bank rate decisions, GDP, Retail Sales and Core PCE. The window runs from 3 minutes before to 3 minutes after the release time (UTC).",
          "Only instruments exposed to the released currency are affected: USD news covers every USD pair, XAU/USD, XAG/USD, US indices, oil and USD-quoted crypto; EUR news covers EUR pairs and GER40; GBP news covers GBP pairs and UK100; JPY news covers JPY pairs and JP225, and so on. GBP/JPY, for example, is not affected by USD news.",
          "Opening a trade (including a pending order that triggers) or closing a trade (manually, by Take Profit or by Stop Loss) inside the window is a Soft Breach. Positions opened before and closed after the window — simply held through it — are allowed.",
          "A Soft Breach does not fail the account. The positive profit of each violating trade is removed from withdrawable profit (losing trades are not refunded), and the trade, the news event and the seconds from the release are shown on the account's Rules tab.",
          "All other rules remain active during news events, including Daily and Overall Drawdown, leverage, Trade Layering where applicable, Minimum Holding Time where applicable, and prohibited-strategy requirements.",
          "Volatility, spread expansion, slippage, or execution delays during news do not exempt an account from any applicable loss or conduct rule.",
        ],
      },
      {
        question: "What is the Weekend Holding rule?",
        answer: [
          "By default, holding any position open during the weekend closure (Saturday 00:00 UTC to Monday 00:00 UTC) is prohibited for every account type and stage — Step 1, Step 2, One Step, and Instant, across both the evaluation/Challenge phase and the Funded stage. Leaving even one position open into that window is a violation.",
          "This applies to every tradable instrument, including 24/7 assets like crypto, which must still be flat before the weekend closure the same as any other instrument.",
          "Weekend holding is only permitted if the trader purchases the Weekend Holding Add-on at checkout, for an additional fee. Every other risk rule continues to apply in full even with the add-on active — the trader accepts full responsibility for weekend gap risk, slippage, and equity/margin swings at market open.",
          "Range4EX monitors positions held through the weekend closure without the add-on. A violation may result in trade removal, profit adjustment, withdrawal rejection, or account termination in repeat or severe cases.",
        ],
        table: {
          headers: ["Account Category", "Weekend Holding", "Requirement"],
          rows: [
            ["Step 1 Evaluation", "Not allowed by default", "Close every position before the weekend closure, or purchase the Weekend Holding Add-on"],
            ["Step 2 Evaluation", "Not allowed by default", "Close every position before the weekend closure, or purchase the Weekend Holding Add-on"],
            ["One Step Evaluation", "Not allowed by default", "Close every position before the weekend closure, or purchase the Weekend Holding Add-on"],
            ["Instant", "Not allowed by default", "Close every position before the weekend closure, or purchase the Weekend Holding Add-on"],
            ["Funded Account (any program)", "Not allowed by default", "Close every position before the weekend closure, or purchase the Weekend Holding Add-on"],
          ],
        },
      },
      {
        question: "Are Expert Advisors and automation allowed?",
        answer: [
          "Commercial or shared EAs sold to multiple traders are prohibited outright.",
          "A personally coded EA is allowed only if it automates the trader's own strategy and does not exploit execution latency, run tick scalping, or trade faster than a human could reasonably verify.",
        ],
      },
      {
        question: "Which strategies are prohibited?",
        answer: ["The following strategies are prohibited or reviewable because they can distort evaluation results or create non-genuine edge:"],
        list: [
          "Tick scalping or latency arbitrage exploiting feed or execution delays",
          "Martingale or aggressive averaging into losing positions to mask drawdown",
          "Grid trading systems that open large numbers of correlated positions",
          "One-sided directional bets sized to pass a target on a single trade",
          "Chasing price through rapid open and close reversals on the same instrument",
          "Hedging the same net exposure across two or more accounts to guarantee a pass",
          "Copy trading between firm accounts or mirroring another trader account to duplicate a result",
        ],
      },
      {
        question: "What happens if a prohibited strategy is detected?",
        answer: [
          "A first instance may be treated as a Soft Breach, with profit removed and a formal warning issued.",
          "A repeat instance, or a severe pattern showing the result is not genuinely the trader's own edge, may be treated as a Hard Breach.",
        ],
      },
      {
        question: "What is the Consistent Strategy Requirement?",
        answer: [
          "Traders must keep a broadly consistent trading style across phases and into the Performance Stage.",
          "A sudden, unexplained change, such as moving from intraday scalping to single oversized swing positions immediately before a payout, may be reviewed and may require written justification.",
        ],
      },
    ],
  },
  {
    id: "breaches",
    eyebrow: "Section 8",
    title: "Breach Policy",
    description: "Consequences for hard breaches, soft breaches, notifications, and appeals.",
    items: [
      {
        question: "What triggers a Hard Breach?",
        answer: [
          "A Hard Breach is triggered by exceeding the Daily Drawdown limit, exceeding the Overall Drawdown limit, or committing a severe or repeated Section 7 conduct violation.",
        ],
      },
      {
        question: "What happens after a Hard Breach?",
        answer: [
          "The account is closed immediately, all open positions are liquidated, and unrealized or unbanked profit is forfeited.",
          "The account cannot be reopened. The trader may purchase a new Evaluation.",
        ],
      },
      {
        question: "What triggers a Soft Breach?",
        answer: [
          "On Instant Funded and Funded accounts, opening or closing a trade on an affected instrument within 3 minutes before or after high-impact news is a Soft Breach. Any Minimum Holding Time violation is a Hard Breach, including the first one.",
        ],
      },
      {
        question: "What happens after a Soft Breach?",
        answer: [
          "The specific profit tied to the violation is removed and the trader receives a written explanation.",
          "The account remains open as long as Equity has not also fallen below the Maximum Drawdown floor.",
        ],
      },
      {
        question: "How are traders notified of a breach?",
        answer: ["Every breach triggers an automatic email stating the violated rule, the timestamp, and the account data supporting the decision."],
      },
      {
        question: "Can a trader appeal a breach?",
        answer: [
          "Yes. A trader may request a manual review within 5 business days by contacting support.",
          "Range4ex's decision after completing the review is final.",
        ],
      },
    ],
  },
  {
    id: "payouts",
    eyebrow: "Section 9",
    title: "Performance Stage and Payouts",
    description: "Performance fee split, payout methods, eligibility rules, and scaling.",
    items: [
      {
        question: "Do advanced simulated accounts have profit targets?",
        answer: ["No. Once a trader reaches the Performance Stage, the profit target no longer applies. Drawdown, leverage, and conduct rules continue exactly as they did during Evaluation."],
      },
      {
        question: "What is the Performance Fee split?",
        answer: ["The standard split is 80% to the trader and 20% to the firm."],
      },
      {
        question: "How does scaling work?",
        answer: [
          "Every consecutive profitable payout cycle without a rule violation may increase the funded balance by 10% to 25%.",
          "The maximum scaled allocation is ,000,000 and all increases remain subject to Range4ex's eligibility review.",
        ],
      },
      {
        question: "What payout methods and schedules are available?",
        answer: ["Approved payouts are processed within 2 to 5 business days. All open positions must be closed before a payout request is submitted."],
        table: {
          headers: ["Method", "Minimum Requirement", "Frequency", "Cap per Payout Period"],
          rows: [
            ["Bi-weekly scheduled", "$100 minimum profit; 3 profitable days at 0.5% each", "Every 14 days", "6% of initial balance per period"],
            ["On-demand", "2% gross profit plus 40% Best Day and 30% Profit Consistency", "Any time once eligible", "6% of initial balance per period"],
          ],
        },
      },
      {
        question: "How does the 6% Withdrawal Cap work?",
        answer: [
          "The Withdrawal Cap applies to Instant Funded and Funded accounts. During any single payout period, the maximum gross profit that may be withdrawn is 6% of the Initial Account Balance, regardless of how much profit the account earned.",
          "Formula: Maximum Withdrawal = Initial Account Balance x 6%. The calculation always uses the Initial Account Balance, not current Balance, Equity, or peak account value, so the cap does not grow with the account.",
          "The cap limits withdrawals, not profit generation. If eligible profit exceeds the cap, the payout request is automatically adjusted to the maximum permitted amount. The excess is not forfeited; it remains in the trading account and may be withdrawn during a future payout period if all rules are still satisfied.",
          "The 6% cap applies independently in each payout period and operates alongside minimum profitable days, Profit Consistency, Best Day, drawdown, leverage, and every other payout requirement.",
        ],
        table: {
          headers: ["Initial Balance", "Eligible Profit", "6% Cap", "Withdrawable", "Profit Remaining"],
          rows: [
            ["$100,000", "$4,500", "$6,000", "$4,500", "$0"],
            ["$100,000", "$6,000", "$6,000", "$6,000", "$0"],
            ["$100,000", "$8,500", "$6,000", "$6,000", "$2,500"],
            ["$50,000", "$5,200", "$3,000", "$3,000", "$2,200"],
          ],
        },
      },
      {
        question: "Can an approved performance reward remain in the program?",
        answer: ["Program options for approved performance rewards are shown in the participant dashboard and remain subject to the current evaluation terms."],
      },
    ],
  },
  {
    id: "account-policies",
    eyebrow: "Section 10",
    title: "General Account Policies",
    description: "Operational account rules covering inactivity, KYC, access, jurisdictions, refunds, and rule updates.",
    items: [
      {
        question: "What is the inactivity policy?",
        answer: ["An account with no executed trade for 30 consecutive calendar days is deactivated and cannot be reinstated. Traders expecting an absence should notify support in advance."],
      },
      {
        question: "When is KYC required?",
        answer: ["Identity verification is required before the first payout is released on any account."],
      },
      {
        question: "Are devices, IP changes, and VPNs allowed?",
        answer: [
          "Device changes, IP changes, and VPN use are permitted for legitimate access reasons.",
          "The account owner who completed KYC must be the person placing trades.",
        ],
      },
      {
        question: "Is group trading allowed?",
        answer: ["No. Multiple traders sharing one account is prohibited and is treated as a Hard Breach."],
      },
      {
        question: "Are any jurisdictions restricted?",
        answer: ["Yes. Restricted jurisdictions may not purchase an Evaluation or hold a Range4ex Performance Account under applicable regulatory and sanctions requirements. Contact support before purchase if eligibility is uncertain."],
      },
      {
        question: "Are evaluation fees refundable?",
        answer: [
          "The Evaluation fee is refunded with the first successful payout from an eligible Two Step or One Step account.",
          "Instant fees are non-refundable because there is no evaluation gate.",
        ],
      },
      {
        question: "Can the firm update the rulebook?",
        answer: [
          "Yes. Range4ex may update the rulebook.",
          "Changes apply to new Evaluation purchases from the effective date and are never applied retroactively to close an account under a rule that did not exist when the account was opened.",
        ],
      },
    ],
  },
  {
    id: "quick-reference",
    eyebrow: "Section 11",
    title: "Quick Reference Summary",
    description: "Condensed comparison of the core account rules.",
    items: [
      {
        question: "What is the quick-reference summary for the main plans?",
        answer: ["This table summarizes the principal rules traders most often need before starting an account."],
        table: {
          headers: ["Rule", "Two Step Evaluation", "One Step Evaluation", "Instant Funded", "Funded Account"],
          rows: [
            ["Profit Target", "10% Phase 1 / 5% Phase 2", "10%", "None", "None"],
            ["Daily Drawdown", "5%", "4%", "3%", "4%"],
            ["Overall Drawdown", "10% static", "10% static", "6% static", "10% static"],
            ["Minimum Profitable Days", "3 per phase", "3", "3 before payout", "3 before payout"],
            ["Minimum Holding Time", "Not applicable", "Not applicable", "3 minutes", "3 minutes"],
            ["Trade Layering", "Not applicable", "Not applicable", "Same instrument/direction: wait 5 minutes", "Same instrument/direction: wait 5 minutes"],
            ["Weekend Holding", "Not allowed", "Not allowed", "Not allowed", "Allowed"],
            ["News Trading", "Allowed", "Allowed", "±3 min window around high-impact news (soft breach)", "±3 min window around high-impact news (soft breach)"],
            ["Profit Consistency at Payout", "Not applicable", "Not applicable", "30%", "30%"],
            ["Withdrawal Cap per Period", "Not applicable", "Not applicable", "6% of initial balance", "6% of initial balance"],
          ],
        },
      },
    ],
  },
  {
    id: "programms-rule-article",
    eyebrow: "Section 12",
    title: "Programms Rule Article",
    description: "Rules by phase: Challenge Phase 1, Challenge Phase 2, Funded account, and Instant funding.",
    items: [
      {
        question: "What are the rules by phase?",
        answer: [
          "Rules by phase: Challenge Phase 1, Challenge Phase 2, Funded account, and Instant funding. Instant uses 3% daily drawdown (from start-of-day equity), 6% maximum drawdown (from initial balance), and 30% profit consistency (same idea as funded-style accounts)."
        ],
        table: {
          headers: ["RULES", "CHALLENGE PHASE 1", "CHALLENGE PHASE 2", "ONE STEP", "FUNDED", "INSTANT"],
          rows: [
            ["Profit Target", "10%", "5%", "10%", "N/A", "0%"],
            ["Max Daily Drawdown", "5%", "5%", "4%", "4%", "3%"],
            ["Max Total Drawdown", "10%", "10%", "10%", "10%", "6%"],
            ["Min Trading Days (Profitable)", "3", "3", "3", "3", "3"],
            ["News Trading", "Allowed", "Allowed", "Allowed", "±3 min window", "±3 min window"],
            ["Weekend Holding", "Not Allowed", "Not Allowed", "Not Allowed", "Allowed", "Not Allowed"],
            ["Min Holding Time", "N/A", "N/A", "N/A", "3 Min.", "3 Min."],
            ["Profit Consistency Rule", "N/A", "N/A", "N/A", "30%", "30%"],
            ["Overnight Holding", "Not Allowed", "Not Allowed", "Not Allowed", "Not Allowed", "Not Allowed"],
          ],
        },
      },
    ],
  },
];

function FaqTable({ table }: { table: NonNullable<FaqItem["table"]> }) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>{table.headers.map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {table.rows.map((row) => (
              <tr key={row.join("-")} className="text-zinc-600">
                {row.map((cell, index) => <td key={`${row[0]}-${cell}`} className={`px-4 py-3.5 ${index === 0 ? "font-semibold text-zinc-950" : ""}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RuleArticle({ item, sectionId, index, forceOpen = false }: { item: FaqItem; sectionId: string; index: number; forceOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const expanded = forceOpen || isOpen;
  const contentId = `${sectionId}-article-${index}`;

  return (
    <div className="border-t border-zinc-200 first:border-t-0">
      <button type="button" aria-expanded={expanded} aria-controls={contentId} onClick={() => setIsOpen((current) => !current)} className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-50 sm:px-6">
        <span className="text-[15px] font-semibold leading-6 text-zinc-800 transition group-hover:text-violet-700">{item.question}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm">
          <IconChevronDown size={17} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </span>
      </button>
      {expanded && (
        <div id={contentId} className="border-t border-zinc-100 bg-[#faf9fc] px-5 pb-6 pt-5 sm:px-6">
          <div className="space-y-3 text-[15px] leading-7 text-zinc-600">{item.answer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          {item.list && <ul className="mt-5 grid gap-3 text-sm leading-6 text-zinc-600">{item.list.map((entry) => <li key={entry} className="flex gap-3"><IconCircleCheck className="mt-0.5 shrink-0 text-violet-600" size={18} /><span>{entry}</span></li>)}</ul>}
          {item.table && <FaqTable table={item.table} />}
        </div>
      )}
    </div>
  );
}

function SectionIcon({ sectionId }: { sectionId: string }) {
  const props = { className: "text-violet-700", size: 24 };
  if (sectionId === "definitions") return <IconFileDescription {...props} />;
  if (sectionId === "programs") return <IconListCheck {...props} />;
  if (sectionId === "drawdown") return <IconLock {...props} />;
  if (sectionId === "trading-days") return <IconClockHour4 {...props} />;
  if (sectionId === "leverage") return <IconScale {...props} />;
  if (sectionId === "conduct") return <IconShieldCheck {...props} />;
  if (sectionId === "breaches") return <IconGavel {...props} />;
  return <IconBook {...props} />;
}

const programHighlights = [
  { name: "Two Step", stage: "2 phases", target: "10% / 5% targets", risk: "5% daily · 10% overall" },
  { name: "One Step", stage: "1 phase", target: "10% target", risk: "4% daily · 10% overall" },
  { name: "Instant", stage: "No evaluation", target: "Direct performance stage", risk: "3% daily · 6% overall" },
];

const programRulebooks: ProgramRulebook[] = [
  {
    key: "two-step",
    name: "Two Step",
    description: "Every rule and requirement for the Two Step evaluation, from Phase 1 through the Performance Stage.",
    articles: [
      { question: "How does the Two Step program work?", answer: ["Two Step has two evaluation phases before the Performance Stage. Complete Phase 1, then Phase 2, while remaining within every applicable risk and conduct rule.", "There is no maximum time limit for either phase."] },
      { question: "What are the Two Step profit targets?", answer: ["Phase 1 requires 10% closed profit and Phase 2 requires 5% closed profit, each calculated from the Initial Account Balance.", "Floating profit does not count toward a target. The target is complete only after the required profitable days and all compliance checks are also met."] },
      { question: "What drawdown limits apply to Two Step?", answer: ["Two Step uses static, balance-and-equity-based drawdown. The daily limit is 5% and the overall limit is 10%, calculated from the Initial Account Balance.", "Both closed and floating losses are monitored. Breaching either limit is a Hard Breach."] },
      { question: "How many profitable trading days are required?", answer: ["Each evaluation phase requires at least 3 profitable days. A qualifying day must finish with net closed profit of at least 0.5% of the Initial Account Balance.", "Multiple trades may count toward one qualifying day, but a day can only count once."] },
      { question: "Can I hold positions over the weekend?", answer: ["No, not by default. All positions must be closed before the weekend closure (Saturday 00:00 UTC) in both evaluation phases and on the Funded Performance Stage.", "Weekend holding is only allowed if the Weekend Holding Add-on was purchased at checkout, for an additional fee. All other risk rules still apply in full with the add-on active."] },
      { question: "Are news trading and leverage allowed?", answer: ["News trading is unrestricted during evaluation. On the Funded Performance Stage, opening or closing a trade on an affected instrument within 3 minutes before or after high-impact news is a Soft Breach and that trade's profit is not withdrawable. The standard leverage is 1:100 on major and minor FX pairs, 1:50 on exotics, and 1:30 on metals where offered.", "Volatility, slippage, or spread widening does not change drawdown or conduct requirements."] },
      { question: "What happens after I pass Two Step?", answer: ["After Phase 2 is passed and compliance is confirmed, the account moves to the Performance Stage. There is no additional profit target.", "The Performance Stage has a 4% daily and 10% overall static drawdown, an 80% trader performance-fee split, and payout eligibility after 3 qualifying profitable days."] },
      { question: "Is the Two Step fee refundable?", answer: ["The evaluation fee is refunded with the first successful payout from an eligible Two Step account, subject to the published payout and compliance conditions."] },
    ],
  },
  {
    key: "one-step",
    name: "One Step",
    description: "Every rule and requirement for the accelerated One Step evaluation and its Performance Stage.",
    articles: [
      { question: "How does the One Step program work?", answer: ["One Step has one evaluation phase before the Performance Stage. It is designed for traders who prefer a single assessment route.", "There is no maximum time limit to complete the phase."] },
      { question: "What is the One Step profit target?", answer: ["The One Step evaluation requires 10% closed profit, calculated from the Initial Account Balance.", "Floating profit does not count. The target must be completed alongside the profitable-day and compliance requirements."] },
      { question: "What drawdown limits apply to One Step?", answer: ["One Step uses static, balance-and-equity-based drawdown. The daily limit is 4% and the overall limit is 10%, fixed from the Initial Account Balance.", "A breach of either limit is a Hard Breach."] },
      { question: "How many profitable trading days are required?", answer: ["The One Step evaluation requires at least 3 profitable days. Each qualifying day must close with net profit of at least 0.5% of the Initial Account Balance."] },
      { question: "Can I hold positions over the weekend?", answer: ["No, not by default. All positions must be closed before the weekend closure (Saturday 00:00 UTC) during evaluation and on the Funded Performance Stage alike.", "Weekend holding is only allowed if the Weekend Holding Add-on was purchased at checkout, for an additional fee. All other risk rules still apply in full with the add-on active."] },
      { question: "Are news trading and leverage allowed?", answer: ["News trading is unrestricted during evaluation. On the Funded Performance Stage, opening or closing a trade on an affected instrument within 3 minutes before or after high-impact news is a Soft Breach and that trade's profit is not withdrawable. The standard leverage is 1:100 on major and minor FX pairs, 1:50 on exotics, and 1:30 on metals where offered.", "All drawdown and conduct rules remain active during news events."] },
      { question: "What happens after I pass One Step?", answer: ["After the target and all requirements are met, the account moves to the Performance Stage with no additional assessment target.", "The Performance Stage uses 4% daily and 10% overall static drawdown, pays an 80% trader performance-fee split, and requires 3 qualifying profitable days before a payout."] },
      { question: "Is the One Step fee refundable?", answer: ["The evaluation fee is refunded with the first successful payout from an eligible One Step account, subject to the published payout and compliance conditions."] },
    ],
  },
  {
    key: "instant",
    name: "Instant",
    description: "Every rule and requirement for the Instant simulated Performance Account from day one.",
    articles: [
      { question: "How does the Instant program work?", answer: ["Instant has no evaluation phase and no profit target. Traders begin in the simulated Performance Stage immediately.", "Because access is immediate, the Instant program has tighter risk controls from day one."] },
      { question: "What drawdown limits apply to Instant?", answer: ["Instant uses static, balance-and-equity-based drawdown. The daily limit is 3% and the overall limit is 6%, calculated from the Initial Account Balance.", "Breaching either limit is a Hard Breach."] },
      { question: "How do profitable days and payouts work?", answer: ["Before a payout, Instant requires at least 3 profitable trading days. Each qualifying day must close with net profit of at least 0.5% of the Initial Account Balance.", "Gross withdrawals are capped at 6% of the Initial Account Balance per payout period, and eligible profit is shared 80% to the trader."] },
      { question: "What is the Profit Consistency Rule?", answer: ["No single trading day's profit may be more than 30% of the account's total profit: Consistency Ratio = (Largest Single Day's Profit / Total Account Profit) x 100, with days grouped at the 00:00 UTC reset.", "If the ratio is above 30%, the rule is violated and the account fails (hard breach)."] },
      { question: "What is the minimum holding-time rule?", answer: ["Every Instant trade must remain open for at least 3 minutes. The first lifetime violation is a warning; the second is an account breach.", "Partial closes do not bypass the rule."] },
      { question: "What is the Trade Layering rule?", answer: ["Do not open another trade on the same instrument in the same direction until 5 full minutes have elapsed from the previous trade's opening time.", "Different instruments or the opposite direction are allowed. Closing a trade does not reset the waiting period."] },
      { question: "Can I trade news or hold over the weekend?", answer: ["Instant accounts may not open or close a trade on an affected instrument within 3 minutes before or after high-impact news; doing so is a Soft Breach and that trade's profit is not withdrawable. All other risk and conduct rules remain active. Weekend holding is not allowed on Instant accounts by default, including on 24/7 assets like crypto; all positions must close before the weekend closure (Saturday 00:00 UTC) unless the Weekend Holding Add-on was purchased at checkout."] },
      { question: "Is the Instant fee refundable?", answer: ["No. Instant fees are non-refundable because there is no evaluation gate."] },
    ],
  },
];

function CollectionCard({ section, onOpen }: { section: FaqSection; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left shadow-[0_12px_36px_rgba(24,16,38,0.06)] transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_20px_48px_rgba(76,29,149,0.12)]"
    >
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-100 transition group-hover:bg-violet-100">
          <SectionIcon sectionId={section.id} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">
                {section.items.length} {section.items.length === 1 ? "article" : "articles"}
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">{section.title}</h3>
            </div>
            <IconChevronRight size={21} className="mt-1 shrink-0 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-violet-700" />
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{section.description}</p>
        </div>
      </div>
      <div className="mt-auto w-full border-t border-zinc-200 bg-zinc-50/70 px-5 py-4 sm:px-6">
        <div className="space-y-2.5">
          {section.items.slice(0, 3).map((item) => (
            <div key={item.question} className="flex items-center gap-2.5 text-sm text-zinc-600">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
              <span className="truncate">{item.question}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-violet-700">View collection</p>
      </div>
    </button>
  );
}

export default function RulesPageContent() {
  const [query, setQuery] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedProgramKey, setSelectedProgramKey] = useState<ProgramKey | null>(null);
  const totalArticles = useMemo(() => sections.reduce((total, section) => total + section.items.length, 0), []);
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && sections.some((section) => section.id === hash)) setSelectedSectionId(hash);
  }, []);

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) return sections;
    return sections.map((section) => {
      const sectionMatches = `${section.title} ${section.description}`.toLowerCase().includes(normalizedQuery);
      const matchingItems = section.items.filter((item) => [item.question, ...item.answer, ...(item.list ?? []), ...(item.table?.headers ?? []), ...(item.table?.rows.flat() ?? [])].join(" ").toLowerCase().includes(normalizedQuery));
      if (sectionMatches) return section;
      return matchingItems.length ? { ...section, items: matchingItems } : null;
    }).filter((section): section is FaqSection => section !== null);
  }, [normalizedQuery]);

  const selectedSection = selectedSectionId ? sections.find((section) => section.id === selectedSectionId) ?? null : null;
  const selectedProgram = selectedProgramKey ? programRulebooks.find((program) => program.key === selectedProgramKey) ?? null : null;
  const resultCount = filteredSections.reduce((total, section) => total + section.items.length, 0);

  const openCollection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setQuery("");
    window.history.replaceState(null, "", `#${sectionId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProgram = (programKey: ProgramKey) => {
    setSelectedProgramKey(programKey);
    setSelectedSectionId(null);
    setQuery("");
    window.history.replaceState(null, "", `#program-${programKey}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeProgram = () => {
    setSelectedProgramKey(null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeCollection = () => {
    setSelectedSectionId(null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#f7f7f9] text-zinc-950">
      <section className="relative overflow-hidden bg-[#10081d] px-4 pb-24 pt-32 sm:px-6 sm:pb-28 sm:pt-40">
        <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/40 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-[-220px] right-[-100px] h-[420px] w-[420px] rounded-full bg-fuchsia-700/20 blur-[110px]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200"><IconBook size={16} />Range4ex Help Center</div>
          <h1 className="mt-6 font-clash-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            {selectedProgram ? `${selectedProgram.name} program rules` : selectedSection ? selectedSection.title : "Trading rules, clearly explained"}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            {selectedProgram ? selectedProgram.description : selectedSection ? selectedSection.description : "Choose a program or rule category, then browse only the relevant articles."}
          </p>

          {!selectedSection && (
            <>
              <div className="relative mx-auto mt-9 max-w-2xl text-left">
                <IconSearch size={22} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rules, percentages, payouts..." aria-label="Search Range4ex rules" className="h-16 w-full rounded-2xl border border-white/20 bg-white px-14 pr-14 text-base font-medium text-zinc-950 shadow-[0_22px_60px_rgba(0,0,0,0.28)] outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/25" />
                {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200"><IconX size={17} /></button>}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-400">
                <span className="font-semibold text-zinc-200">Popular:</span>
                {["Daily drawdown", "Trade layering", "Profit consistency", "Minimum holding time", "Payouts"].map((term) => <button key={term} type="button" onClick={() => setQuery(term)} className="transition hover:text-white">{term}</button>)}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="relative z-10 -mt-12 px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {selectedProgram ? (
            <div className="mx-auto max-w-4xl">
              <button type="button" onClick={closeProgram} className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700">
                <IconArrowLeft size={18} /> All programs
              </button>
              <section id={`program-${selectedProgram.key}`} className="scroll-mt-28 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_50px_rgba(24,16,38,0.09)]">
                <div className="p-6 sm:p-8"><div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 ring-1 ring-violet-100"><IconListCheck className="text-violet-700" size={24} /></div><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">{selectedProgram.articles.length} complete articles</p><h2 className="mt-1 text-2xl font-bold tracking-tight">{selectedProgram.name} program rulebook</h2><p className="mt-2 text-sm leading-6 text-zinc-600">These articles apply to the selected program. Select an article to read the complete rule.</p></div></div></div>
                <div className="border-t border-zinc-200">{selectedProgram.articles.map((item, index) => <RuleArticle key={item.question} item={item} sectionId={`program-${selectedProgram.key}`} index={index} />)}</div>
              </section>
            </div>
          ) : selectedSection ? (
            <div className="mx-auto max-w-4xl">
              <button type="button" onClick={closeCollection} className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700">
                <IconArrowLeft size={18} /> All rule categories
              </button>
              <section id={selectedSection.id} className="scroll-mt-28 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_50px_rgba(24,16,38,0.09)]">
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 ring-1 ring-violet-100"><SectionIcon sectionId={selectedSection.id} /></div>
                    <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">{selectedSection.items.length} {selectedSection.items.length === 1 ? "article" : "articles"}</p><h2 className="mt-1 text-2xl font-bold tracking-tight">{selectedSection.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-600">Select an article below to read the complete rule.</p></div>
                  </div>
                </div>
                <div className="border-t border-zinc-200">{selectedSection.items.map((item, index) => <RuleArticle key={item.question} item={item} sectionId={selectedSection.id} index={index} />)}</div>
              </section>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {programHighlights.map((program) => (
                  <button key={program.name} type="button" onClick={() => openProgram(program.name.toLowerCase().replace(" ", "-") as ProgramKey)} className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-[0_16px_45px_rgba(24,16,38,0.08)] transition hover:-translate-y-1 hover:border-violet-300">
                    <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{program.name}</h2><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{program.stage}</span></div>
                    <p className="mt-4 text-sm font-semibold text-zinc-800">{program.target}</p><p className="mt-1 text-sm text-zinc-500">{program.risk}</p>
                    <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700"><IconShieldCheck size={16} />Static, balance/equity-based drawdown</p>
                  </button>
                ))}
              </div>

              <div className="mt-14 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div><p className="text-sm font-semibold text-violet-700">Official Range4ex rulebook</p><h2 className="mt-2 font-clash-display text-3xl font-semibold tracking-tight sm:text-4xl">Browse rules by category</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">{sections.length} collections and {totalArticles} detailed articles. Open one collection to see only its rules.</p></div>
                {!normalizedQuery && <span className="text-sm font-medium text-zinc-500">Two Step · One Step · Instant</span>}
              </div>

              {normalizedQuery && <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4"><div><p className="text-sm font-semibold text-violet-900">{resultCount ? `${resultCount} ${resultCount === 1 ? "article" : "articles"} found` : "No matching rules found"}</p><p className="mt-1 text-sm text-violet-700">Choose a matching collection for &quot;{query.trim()}&quot;</p></div><button type="button" onClick={() => setQuery("")} className="shrink-0 text-sm font-semibold text-violet-800 hover:text-violet-950">Clear search</button></div>}

              <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-2">
                {filteredSections.map((section) => <CollectionCard key={section.id} section={section} onOpen={() => openCollection(section.id)} />)}
              </div>

              {normalizedQuery && filteredSections.length === 0 && <div className="mt-8 rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm"><IconSearch size={30} className="mx-auto text-zinc-400" /><h3 className="mt-4 text-lg font-bold">Try another search</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">Search for a program, percentage, strategy, trading condition, or payout requirement.</p><button type="button" onClick={() => setQuery("")} className="mt-6 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-800">Browse all rules</button></div>}
            </>
          )}

          <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold">Need clarification before trading?</h3><p className="mt-1 text-sm text-zinc-600">Contact Range4ex support before opening a position if any rule is unclear.</p></div><a href="contact" className="inline-flex items-center justify-center rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-800">Contact support</a></div>
        </div>
      </section>
    </main>
  );
}