/**
 * News Trading Rule tests. Run with: npm run test:news
 *
 * Fixture: NFP (USD) at 12:30:00 UTC and ECB rate decision (EUR) at 12:15:00 UTC,
 * restricted window ±3 minutes (NEWS_RESTRICTED_MINUTES_EACH_SIDE), inclusive.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectNewsViolations,
  extractNewsTrades,
  getSymbolCurrencies,
  newsProfitToDeduct,
  normalizeSymbol,
  parseCalendarFeed,
  toUtcDate,
  type NewsEvent,
  type NewsTrade,
} from "./newsRule";
import { NEWS_RESTRICTED_MINUTES_EACH_SIDE, CHALLENGE_RULES, newsRuleApplies } from "./rulebook";

const DAY = "2026-10-02";
const at = (hhmmss: string) => new Date(`${DAY}T${hhmmss}Z`);
const EVENTS: NewsEvent[] = [
  { eventTime: `${DAY}T12:30:00.000Z`, currency: "USD", title: "Non-Farm Employment Change" },
  { eventTime: `${DAY}T12:15:00.000Z`, currency: "EUR", title: "Main Refinancing Rate" },
];
const WINDOW = NEWS_RESTRICTED_MINUTES_EACH_SIDE;

const FUNDED = { rule: CHALLENGE_RULES.two_step_standard, phase: "Funded (Live)", status: "Funded" };
const INSTANT = { rule: CHALLENGE_RULES.instant_funding, phase: "Funded (Live)", status: "Active" };
const PHASE1 = { rule: CHALLENGE_RULES.two_step_standard, phase: "Phase 1 (Evaluation)", status: "Active" };

/** Mirrors evaluateAccountRules: the rule only runs when newsRuleApplies() is true. */
function check(
  account: { rule: { key: any }; phase: string; status: string },
  trades: NewsTrade[],
  legacyRules = false,
) {
  const applies = newsRuleApplies(account.rule, account.phase, account.status, legacyRules ? "legacy" : "current");
  return applies ? detectNewsViolations(trades, EVENTS, WINDOW) : [];
}

function trade(ticket: string, symbol: string, open: string, close?: string, profit = 100): NewsTrade {
  return { ticket, symbol, openTime: at(open), closeTime: close ? at(close) : undefined, profit };
}

test("window is 3 minutes each side", () => {
  assert.equal(WINDOW, 3);
});

test("1. Funded, EURUSD.r opened 12:28:00 → opened_in_window (-120s)", () => {
  const v = check(FUNDED, [trade("1", "EURUSD.r", "12:28:00", "13:00:00")]);
  assert.equal(v.length, 1);
  assert.equal(v[0].type, "opened_in_window");
  assert.equal(v[0].secondsFromEvent, -120);
  assert.equal(v[0].currency, "USD");
  assert.equal(v[0].symbol, "EURUSD");
});

test("2. Funded, XAUUSDm opened 10:00, TP hit 12:31:00 → closed_in_window (+60s)", () => {
  const v = check(FUNDED, [trade("2", "XAUUSDm", "10:00:00", "12:31:00")]);
  assert.equal(v.length, 1);
  assert.equal(v[0].type, "closed_in_window");
  assert.equal(v[0].secondsFromEvent, 60);
});

test("3. Funded, USDJPY opened 12:34:00 → clean (240s)", () => {
  assert.deepEqual(check(FUNDED, [trade("3", "USDJPY", "12:34:00", "13:10:00")]), []);
});

test("4. Funded, EURUSD opened 12:27:00 → exactly 180s is INSIDE (flagged); 12:26:59 is clean", () => {
  const edge = check(FUNDED, [trade("4a", "EURUSD", "12:27:00", "12:40:00")]);
  assert.equal(edge.length, 1);
  assert.equal(edge[0].type, "opened_in_window");
  assert.equal(edge[0].secondsFromEvent, -180);
  assert.deepEqual(check(FUNDED, [trade("4b", "EURUSD", "12:26:59", "12:40:00")]), []);
});

test("5. Funded, GBPJPY opened 12:29:00 → clean (no USD exposure)", () => {
  assert.deepEqual(check(FUNDED, [trade("5", "GBPJPY", "12:29:00", "13:00:00")]), []);
});

test("6. Phase 1 challenge, EURUSD opened 12:29:00 → clean (rule not applied)", () => {
  assert.deepEqual(check(PHASE1, [trade("6", "EURUSD", "12:29:00", "13:00:00")]), []);
});

test("7. Instant, NAS100 opened 12:28 closed 12:32 at a loss → flagged twice, deduction 0", () => {
  const v = check(INSTANT, [trade("7", "NAS100", "12:28:00", "12:32:00", -250)]);
  assert.equal(v.length, 2);
  assert.deepEqual(v.map((x) => x.type).sort(), ["closed_in_window", "opened_in_window"]);
  assert.deepEqual(v.map((x) => x.secondsFromEvent).sort((a, b) => a - b), [-120, 120]);
  assert.equal(newsProfitToDeduct(v), 0);
});

test("8. Instant, GER40 still open, opened 12:13:00 → flagged (ECB)", () => {
  const v = check(INSTANT, [trade("8", "GER40", "12:13:00")]);
  assert.equal(v.length, 1);
  assert.equal(v[0].currency, "EUR");
  assert.equal(v[0].eventTitle, "Main Refinancing Rate");
  assert.equal(v[0].secondsFromEvent, -120);
});

test("9. Funded, EURUSD opened 12:00 closed 13:00 → clean (held through)", () => {
  assert.deepEqual(check(FUNDED, [trade("9", "EURUSD", "12:00:00", "13:00:00")]), []);
});

test("10. Funded order with legacyRules = true, EURUSD 12:29 → clean", () => {
  assert.deepEqual(check(FUNDED, [trade("10", "EURUSD", "12:29:00", "13:00:00")], true), []);
});

test("11. Broker server time (UTC+3) is converted to UTC before checking", () => {
  // 15:29:00 on a UTC+3 server is 12:29:00 UTC — one minute before NFP.
  assert.equal(toUtcDate("2026-10-02 15:29:00", 180)?.toISOString(), `${DAY}T12:29:00.000Z`);
  // Values that carry a zone are never shifted.
  assert.equal(toUtcDate(`${DAY}T12:29:00Z`, 180)?.toISOString(), `${DAY}T12:29:00.000Z`);

  const payload = {
    account_info: { timezone: "UTC+3" },
    statistics: {
      advanced_statistics: {
        charts: {
          recent_trades_duration: [
            { ticket: 111, symbol: "EURUSD-ECN", open_time: "2026-10-02 15:29:00", close_time: "2026-10-02 16:00:00", net_profit: 40 },
          ],
        },
      },
    },
  };
  const trades = extractNewsTrades(payload);
  assert.equal(trades[0].openTime.toISOString(), `${DAY}T12:29:00.000Z`);
  const v = check(FUNDED, trades);
  assert.equal(v.length, 1);
  assert.equal(v[0].secondsFromEvent, -60);

  // Read as UTC (no offset) the same trade would be 3 hours off and miss NFP.
  const naive = check(FUNDED, [{ ...trades[0], openTime: toUtcDate("2026-10-02 15:29:00", 0)! }]);
  assert.deepEqual(naive, []);
});

test("12. newsProfitToDeduct counts a trade flagged twice only once", () => {
  const v = check(INSTANT, [
    trade("12a", "US100.cash", "12:28:00", "12:32:00", 300), // flagged on open AND close
    trade("12b", "XAUUSD", "12:31:00", "13:00:00", 50),
    trade("12c", "EURUSD", "12:29:30", "12:45:00", -80), // loss: not refunded
  ]);
  assert.equal(v.filter((x) => x.ticket === "12a").length, 2);
  assert.equal(newsProfitToDeduct(v), 350);
});

test("symbol normalization and currency exposure", () => {
  assert.equal(normalizeSymbol("EURUSD+"), "EURUSD");
  assert.equal(normalizeSymbol("#EURUSD"), "EURUSD");
  assert.equal(normalizeSymbol("eurusd_i"), "EURUSD");
  assert.equal(normalizeSymbol("DE40"), "GER40");
  assert.equal(normalizeSymbol("USTEC"), "US100");
  assert.deepEqual(getSymbolCurrencies("GBPJPY"), ["GBP", "JPY"]);
  assert.deepEqual(getSymbolCurrencies("XAGUSD"), ["USD"]);
  assert.deepEqual(getSymbolCurrencies("BTCUSD"), ["USD"]);
  assert.deepEqual(getSymbolCurrencies("ETHUSDT"), ["USD"]);
  assert.deepEqual(getSymbolCurrencies("WTI"), ["USD"]);
  assert.deepEqual(getSymbolCurrencies("UK100"), ["GBP"]);
  assert.deepEqual(getSymbolCurrencies("JP225"), ["JPY"]);
  assert.deepEqual(getSymbolCurrencies("SPX500"), ["USD"]);
});

test("recent_trades rows without a real open time derive it from duration", () => {
  const payload = {
    statistics: {
      advanced_statistics: {
        charts: {
          recent_trades_duration: [
            // TP hit at 12:31:00 after a 2h31m hold; open_time duplicates close_time.
            { ticket: 5, symbol: "XAUUSD", open_time: `${DAY} 12:31:00`, close_time: `${DAY} 12:31:00`, duration: 9060, net_profit: 90 },
          ],
        },
      },
    },
  };
  const [t] = extractNewsTrades(payload);
  assert.equal(t.openTime.toISOString(), `${DAY}T10:00:00.000Z`);
  const v = check(FUNDED, [t]);
  assert.equal(v.length, 1);
  assert.equal(v[0].type, "closed_in_window");
});

test("Forex Factory feed: keeps High + covered currencies and converts -04:00 to UTC", () => {
  const rows = parseCalendarFeed([
    { title: "Non-Farm Employment Change", country: "USD", date: "2026-10-02T08:30:00-04:00", impact: "High" },
    { title: "Unemployment Rate", country: "USD", date: "2026-10-02T08:30:00-04:00", impact: "Medium" },
    { title: "Bank Holiday", country: "CNY", date: "2026-10-01T00:00:00-04:00", impact: "High" },
    { title: "Cash Rate", country: "AUD", date: "2026-09-29T00:30:00-04:00", impact: "High" },
  ]);
  assert.deepEqual(
    rows.map((row) => [row.currency, row.title, row.eventTime]),
    [
      ["USD", "Non-Farm Employment Change", "2026-10-02T12:30:00.000Z"],
      ["AUD", "Cash Rate", "2026-09-29T04:30:00.000Z"],
    ],
  );
});
