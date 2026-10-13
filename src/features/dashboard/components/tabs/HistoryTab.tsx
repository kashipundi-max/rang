"use client";

import React, { useState } from "react";
import {
  IconSearch,
  IconDownload,
  IconFilter,
  IconArrowUpRight,
  IconArrowDownRight,
} from "../Icons";
import { Trade } from "../../index";

interface HistoryTabProps {
  trades: Trade[];
  accountId: string;
}

export default function HistoryTab({ trades, accountId }: HistoryTabProps) {
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"All" | "Buy" | "Sell">("All");
  const [plFilter, setPlFilter] = useState<"All" | "Profit" | "Loss">("All");

  // Filtering logic
  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol.toLowerCase().includes(search.toLowerCase());
    const matchesDirection = directionFilter === "All" || trade.direction === directionFilter;
    
    let matchesPl = true;
    if (plFilter === "Profit") matchesPl = trade.pl > 0;
    else if (plFilter === "Loss") matchesPl = trade.pl < 0;

    return matchesSearch && matchesDirection && matchesPl;
  });

  // Client-side CSV exporter
  const handleExportCSV = () => {
    if (filteredTrades.length === 0) return;

    const headers = ["ID", "Open Time", "Close Time", "Symbol", "Direction", "Lots", "Entry Price", "Exit Price", "P&L", "Duration"];
    const rows = filteredTrades.map((t) => [
      t.id,
      t.openDate || "",
      t.date,
      t.symbol,
      t.direction,
      t.lots,
      t.entryPrice,
      t.exitPrice,
      t.pl,
      t.duration,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TradeHistory_Acc${accountId}_Export.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-secondary pb-4">
        <div>
          <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white">Trade History</h1>
          <p className="text-text-secondary text-sm">
            Audit and export complete historical trade logs for Account <span className="font-mono text-white font-semibold">#{accountId}</span>.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredTrades.length === 0}
          className="self-start px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 disabled:opacity-40 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer text-white"
        >
          <IconDownload size={15} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters Area */}
      <div className="dash-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by Symbol (e.g. EURUSD)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 focus:border-neutral-700 text-white outline-none font-mono"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid w-full grid-cols-2 items-center gap-3 md:flex md:w-auto">
          <div className="hidden md:flex items-center gap-2 text-xs text-text-secondary">
            <IconFilter size={14} />
            <span>Direction:</span>
          </div>
          <select
            value={directionFilter}
            onChange={(e: any) => setDirectionFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 md:py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 text-white outline-none cursor-pointer"
          >
            <option value="All">All Directions</option>
            <option value="Buy">Buys Only</option>
            <option value="Sell">Sells Only</option>
          </select>

          <div className="hidden md:flex items-center gap-2 text-xs text-text-secondary ml-0 md:ml-4">
            <IconFilter size={14} />
            <span>Result:</span>
          </div>
          <select
            value={plFilter}
            onChange={(e: any) => setPlFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 md:py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 text-white outline-none cursor-pointer"
          >
            <option value="All">All Results</option>
            <option value="Profit">Profits Only</option>
            <option value="Loss">Losses Only</option>
          </select>
        </div>
      </div>

      {/* Trade Log Table */}
      <div className="dash-card">
        {/* Phones: one card per trade instead of a 10-column table */}
        <ul className="divide-y divide-neutral-900/60 md:hidden">
          {filteredTrades.map((trade) => (
            <li key={trade.id} className="p-4 font-mono text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{trade.symbol}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        trade.direction === "Buy"
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border border-rose-500/20 bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {trade.direction}
                    </span>
                    <span className="text-neutral-500">{trade.lots} lot</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-neutral-500">#{trade.id}</span>
                  <span className="mt-0.5 block text-[10px] text-neutral-500">Open {trade.openDate || "—"}</span>
                  <span className="block text-[10px] text-neutral-500">Close {trade.date}</span>
                </div>
                <span className={`shrink-0 text-sm font-bold ${trade.pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {trade.pl >= 0 ? "+" : "-"}${Math.abs(trade.pl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-neutral-400">
                <span><span className="block text-neutral-600">Entry</span>{trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</span>
                <span><span className="block text-neutral-600">Exit</span>{trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</span>
                <span className="text-right"><span className="block text-neutral-600">Duration</span>{trade.duration}</span>
              </div>
            </li>
          ))}
          {filteredTrades.length === 0 && (
            <li className="py-16 text-center text-xs text-neutral-500">No trades match your search filters.</li>
          )}
        </ul>
        <div className="hidden overflow-x-auto custom-scrollbar md:block">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800 text-text-secondary uppercase text-[10px] tracking-wider font-bold">
                <th className="p-4">Trade ID</th>
                <th className="p-4">Open Time</th>
                <th className="p-4">Close Time</th>
                <th className="p-4">Symbol</th>
                <th className="p-4 text-center">Type</th>
                <th className="p-4 text-right">Lots</th>
                <th className="p-4 text-right">Entry Price</th>
                <th className="p-4 text-right">Exit Price</th>
                <th className="p-4 text-right">Duration</th>
                <th className="p-4 text-right">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900/60">
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-neutral-900/40 text-neutral-300">
                  <td className="p-4 text-neutral-500 font-semibold">#{trade.id}</td>
                  <td className="p-4 whitespace-nowrap text-neutral-400">{trade.openDate || "—"}</td>
                  <td className="p-4 whitespace-nowrap text-neutral-400">{trade.date}</td>
                  <td className="p-4 font-bold text-white">{trade.symbol}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                        trade.direction === "Buy"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {trade.direction}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold">{trade.lots}</td>
                  <td className="p-4 text-right text-neutral-400">
                    {trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                  </td>
                  <td className="p-4 text-right text-neutral-400">
                    {trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                  </td>
                  <td className="p-4 text-right text-neutral-400">{trade.duration}</td>
                  <td
                    className={`p-4 text-right font-bold text-sm ${
                      trade.pl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    <span className="flex items-center justify-end gap-1.5">
                      {trade.pl >= 0 ? "+" : ""}
                      ${trade.pl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      {trade.pl >= 0 ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTrades.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-neutral-500 font-sans">
                    No trades match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-neutral-900 bg-neutral-950 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-secondary">
          <span>Showing {filteredTrades.length} of {trades.length} entries</span>
          <span>Security Audit Token: SHA256-PF</span>
        </div>
      </div>
    </div>
  );
}
