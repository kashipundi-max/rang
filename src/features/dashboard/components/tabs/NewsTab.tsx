"use client";

import React, { useState, useEffect } from "react";
import {
  IconNews,
  IconCalendar,
  IconAlertCircle,
  IconPin,
  IconFilter,
} from "../Icons";

interface MarketNewsArticle {
  title: string;
  description: string;
  link: string;
  date: string;
  time: string;
}

export default function NewsTab() {
  const [impactFilter, setImpactFilter] = useState<"All" | "High" | "Medium">("All");
  const [activeSubTab, setActiveSubTab] = useState<"market" | "company">("market");
  
  const [marketNews, setMarketNews] = useState<MarketNewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchMarketNews = async () => {
      try {
        setLoadingNews(true);
        const res = await fetch("/api/news");
        const data = await res.json();
        if (data.success) {
          setMarketNews(data.news || []);
        }
      } catch (err) {
        console.error("Error loading market news:", err);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchMarketNews();
  }, []);

  const announcements = [
    {
      id: "a1",
      title: "New Trading Platform cTrader Now Available!",
      date: "2026-06-24",
      pinned: true,
      summary:
        "We are thrilled to launch support for cTrader across all account challenges and funded phases. Select cTrader on checkout to enjoy ultra-tight spreads, direct API integration, and modern visual indicators.",
    },
    {
      id: "a2",
      title: "Payout Processing SLA Reduced to 4 Hours",
      date: "2026-06-15",
      pinned: false,
      summary:
        "Our finance department has updated its automated settlement ledger. Crypto payments (USDT / BTC) will now clear within 4 hours of approval. Bank wires still require 1-3 business days.",
    },
    {
      id: "a3",
      title: "Summer Fee Rebate Promo Code",
      date: "2026-06-02",
      pinned: false,
      summary:
        "Get 10% off any challenge size with coupon code 'LUNAR10'. Passing the challenge completely refunds this evaluation fee upon receiving your first funded payout settlement.",
    },
  ];

  const calendarEvents = [
    {
      time: "12:30 UTC",
      currency: "USD",
      event: "Core CPI (MoM & YoY)",
      impact: "High",
      forecast: "0.3%",
      previous: "0.2%",
      date: "Today",
    },
    {
      time: "14:00 UTC",
      currency: "USD",
      event: "FOMC Economic Projections",
      impact: "High",
      forecast: "N/A",
      previous: "N/A",
      date: "Today",
    },
    {
      time: "08:30 UTC",
      currency: "EUR",
      event: "German Manufacturing PMI",
      impact: "Medium",
      forecast: "42.8",
      previous: "42.1",
      date: "Tomorrow",
    },
    {
      time: "12:30 UTC",
      currency: "USD",
      event: "Initial Jobless Claims",
      impact: "Medium",
      forecast: "220K",
      previous: "218K",
      date: "Tomorrow",
    },
    {
      time: "12:30 UTC",
      currency: "USD",
      event: "Non-Farm Employment Change (NFP)",
      impact: "High",
      forecast: "185K",
      previous: "206K",
      date: "Friday",
    },
  ];

  const filteredCalendar = calendarEvents.filter((ev) => {
    if (impactFilter === "All") return true;
    return ev.impact === impactFilter;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Title */}
      <div className="border-b border-border-secondary pb-4">
        <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white flex items-center gap-2">
          Announcements & Economic Calendar
        </h1>
        <p className="text-text-secondary text-sm">
          Keep track of prop firm updates, policy alterations, and high-volatility calendar announcements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Announcements / Market News */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-white/5 pb-2.5 gap-4">
            <button
              onClick={() => setActiveSubTab("market")}
              className={`text-xs font-semibold pb-1.5 transition-all cursor-pointer border-b-2 ${
                activeSubTab === "market"
                  ? "text-white border-white font-bold"
                  : "text-neutral-500 border-transparent hover:text-neutral-300"
              }`}
            >
              Market Live Feed
            </button>
            <button
              onClick={() => setActiveSubTab("company")}
              className={`text-xs font-semibold pb-1.5 transition-all cursor-pointer border-b-2 ${
                activeSubTab === "company"
                  ? "text-white border-white font-bold"
                  : "text-neutral-500 border-transparent hover:text-neutral-300"
              }`}
            >
              Company Alerts
            </button>
          </div>

          {activeSubTab === "market" ? (
            <div className="space-y-4">
              {loadingNews ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="text-xs text-neutral-500 font-mono">Fetching latest news from API...</span>
                </div>
              ) : marketNews.length > 0 ? (
                marketNews.map((article, idx) => (
                  <div
                    key={idx}
                    className="dash-card p-5 group flex flex-col justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono block mb-1">
                        {article.date} • {article.time}
                      </span>
                      <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                        {article.description}
                      </p>
                    </div>
                    <div className="flex justify-end pt-1">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-white/5 hover:border-white/10 text-[10px] font-bold rounded-lg text-white font-mono cursor-pointer transition-colors"
                      >
                        Read Source →
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-500 font-mono border border-dashed border-white/5 rounded-xl bg-neutral-950/20 backdrop-blur-md">
                  No real-time market news available.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="dash-card p-5 group"
                >
                  {ann.pinned && (
                    <span className="absolute top-4 right-4 text-neutral-500 flex items-center gap-1 text-[10px] font-mono font-semibold uppercase">
                      <IconPin size={12} className="rotate-45" />
                      Pinned
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-500 font-mono block mb-1">
                    Posted: {ann.date}
                  </span>
                  <h4 className="text-sm font-semibold text-white group-hover:underline cursor-pointer">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    {ann.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Economic Calendar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCalendar size={20} className="text-white" />
              <h3 className="text-sm font-semibold text-white">Economic Calendar</h3>
            </div>
            {/* Filter */}
            <select
              value={impactFilter}
              onChange={(e: any) => setImpactFilter(e.target.value)}
              className="px-2 py-1 text-[10px] rounded bg-neutral-950 border border-neutral-800 text-neutral-400 outline-none cursor-pointer"
            >
              <option value="All">All Impact</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
            </select>
          </div>

          {/* Trading policy notice */}
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex gap-2.5">
            <IconAlertCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-400 leading-normal font-sans">
              <strong>News Trading Allowed:</strong> You may trade during high-impact events on every account type. All other trading and risk rules remain active.
            </p>
          </div>

          <div className="space-y-3">
            {filteredCalendar.map((ev, i) => (
              <div
                key={i}
                className="dash-card rounded-xl p-3.5 text-xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-white bg-neutral-900 px-1.5 py-0.5 rounded">
                      {ev.currency}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {ev.date} • {ev.time}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 text-[8px] font-bold rounded uppercase border ${
                      ev.impact === "High"
                        ? "bg-rose-500/15 border-rose-500/20 text-rose-400"
                        : "bg-amber-500/15 border-amber-500/20 text-amber-400"
                    }`}
                  >
                    {ev.impact} Impact
                  </span>
                </div>

                <h4 className="font-semibold text-white leading-tight">{ev.event}</h4>

                <div className="grid grid-cols-2 gap-4 pt-1 font-mono text-[10px] text-text-secondary border-t border-neutral-900/60 mt-1">
                  <div>
                    <span>Forecast:</span>{" "}
                    <span className="text-neutral-400 font-semibold">{ev.forecast}</span>
                  </div>
                  <div>
                    <span>Previous:</span>{" "}
                    <span className="text-neutral-400 font-semibold">{ev.previous}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
