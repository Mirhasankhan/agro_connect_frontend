"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  LineChart,  
  ArrowUpRight,
  Info,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
  ScriptableContext,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useGetProducerEarningChartQuery } from "@/redux/features/payment/paymentApi";
import { TEarningChartType, TEarningChartPoint } from "@/types";
import { formatCurrency } from "@/utils/formatters";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DAY_FULL_NAMES: Record<string, string> = {
  sat: "Saturday",
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
};

const MONTH_FULL_NAMES: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

export default function ProducerEarningChart() {
  const [timeframe, setTimeframe] = useState<TEarningChartType>("monthly");
  const [chartMode, setChartMode] = useState<"line" | "bar">("line");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: chartResponse, isLoading, isFetching } = useGetProducerEarningChartQuery({
    type: timeframe,
  });

  const chartPoints: TEarningChartPoint[] = useMemo(() => {
    return chartResponse?.data || [];
  }, [chartResponse]);

  // Aggregate stats
  const totalEarning = useMemo(() => {
    return chartPoints.reduce((acc, curr) => acc + (curr.earning || 0), 0);
  }, [chartPoints]);

  const peakPoint = useMemo(() => {
    if (!chartPoints.length) return null;
    let max = chartPoints[0];
    for (const point of chartPoints) {
      if ((point.earning || 0) > (max.earning || 0)) {
        max = point;
      }
    }
    return max;
  }, [chartPoints]);


  // Prepare labels and values
  const labels = useMemo(() => {
    return chartPoints.map((item) => {
      if (item.day) {
        return item.day.charAt(0).toUpperCase() + item.day.slice(1);
      }
      return item.month || "";
    });
  }, [chartPoints]);

  const values = useMemo(() => {
    return chartPoints.map((item) => item.earning || 0);
  }, [chartPoints]);

  const formatPointLabel = (index: number) => {
    const raw = chartPoints[index];
    if (!raw) return "";
    if (timeframe === "weekly" && raw.day) {
      return DAY_FULL_NAMES[raw.day.toLowerCase()] || raw.day;
    }
    if (timeframe === "monthly" && raw.month) {
      return `${MONTH_FULL_NAMES[raw.month] || raw.month} ${new Date().getFullYear()}`;
    }
    return labels[index] || "";
  };

  const lineData: ChartData<"line"> = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "Earnings",
          data: values,
          fill: true,
          borderColor: "#059669",
          borderWidth: 2.5,
          tension: 0.38,
          pointBackgroundColor: "#059669",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#047857",
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2.5,
          backgroundColor: (context: ScriptableContext<"line">) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 320);
            gradient.addColorStop(0, "rgba(16, 185, 129, 0.32)");
            gradient.addColorStop(0.7, "rgba(16, 185, 129, 0.08)");
            gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
            return gradient;
          },
        },
      ],
    };
  }, [labels, values]);

  const barData: ChartData<"bar"> = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "Earnings",
          data: values,
          backgroundColor: (context: ScriptableContext<"bar">) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(16, 185, 129, 0.95)");
            gradient.addColorStop(1, "rgba(5, 150, 105, 0.65)");
            return gradient;
          },
          hoverBackgroundColor: "#047857",
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 38,
        },
      ],
    };
  }, [labels, values]);

  const commonOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleColor: "#f8fafc",
          bodyColor: "#10b981",
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            title: (items: any[]) => {
              const item = items[0];
              if (!item) return "";
              return formatPointLabel(item.dataIndex);
            },
            label: (item: any) => {
              const val = Number(item.raw) || 0;
              return `Revenue: ${formatCurrency(val)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: "#64748b",
            font: {
              family: "inherit",
              size: 11,
              weight: 500,
            },
            padding: 8,
          },
        },
        y: {
          beginAtZero: true,
          border: {
            display: false,
          },
          grid: {
            color: "rgba(226, 232, 240, 0.8)",
          },
          ticks: {
            color: "#64748b",
            font: {
              family: "inherit",
              size: 11,
            },
            padding: 8,
            callback: (value: any) => {
              const num = Number(value);
              if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
              if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
              return `${num}`;
            },
          },
        },
      },
    };
  }, [timeframe, chartPoints]);

  const lineOptions: ChartOptions<"line"> = commonOptions as ChartOptions<"line">;
  const barOptions: ChartOptions<"bar"> = commonOptions as ChartOptions<"bar">;

  const peakLabel = useMemo(() => {
    if (!peakPoint || (peakPoint.earning || 0) <= 0) return "No sales yet";
    if (timeframe === "weekly" && peakPoint.day) {
      return DAY_FULL_NAMES[peakPoint.day.toLowerCase()] || peakPoint.day;
    }
    if (timeframe === "monthly" && peakPoint.month) {
      return MONTH_FULL_NAMES[peakPoint.month] || peakPoint.month;
    }
    return "";
  }, [peakPoint, timeframe]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Top Header & Interactive Switchers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                Harvest Revenue Analytics
              </h2>
              <p className="text-xs text-slate-500">
                Track real-time payout earnings across your wholesale & retail produce sales.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Toggle: Weekly / Monthly */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeframe("weekly")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === "weekly"
                  ? "bg-white text-emerald-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === "monthly"
                  ? "bg-white text-emerald-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly ({new Date().getFullYear()})
            </button>
          </div>

          {/* Chart Display Mode: Line / Bar */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              title="Curved Area View"
              onClick={() => setChartMode("line")}
              className={`p-1.5 rounded-lg transition-all ${
                chartMode === "line"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Column Bar View"
              onClick={() => setChartMode("bar")}
              className={`p-1.5 rounded-lg transition-all ${
                chartMode === "bar"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/producer/earnings"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 ml-1 hover:underline"
          >
            Earnings Page
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

     

      {/* Chart Canvas Area */}
      <div className="relative min-h-[300px] h-[320px] w-full pt-2">
        {!isMounted || isLoading ? (
          <div className="absolute inset-0 flex flex-col justify-end space-y-3 p-4 bg-slate-50/50 rounded-xl animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="flex items-end justify-between gap-3 h-48 pt-6">
              {[40, 65, 30, 85, 55, 90, 45, 60, 75, 50, 80, 65].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-emerald-100/70 rounded-t"
                />
              ))}
            </div>
            <div className="h-3 bg-slate-200 rounded w-full" />
          </div>
        ) : (
          <>
            {isFetching && (
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                  Updating...
                </span>
              </div>
            )}

            {totalEarning === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm text-center max-w-sm">
                  <p className="text-xs font-semibold text-slate-800">
                    No earnings recorded for this {timeframe === "weekly" ? "week" : "year"} yet
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Orders marked as Sent to Hub and completed will automatically plot here.
                  </p>
                </div>
              </div>
            )}

            {chartMode === "bar" ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <Line data={lineData} options={lineOptions} />
            )}
          </>
        )}
      </div>

      {/* Footer Info Notice */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          Earnings are transferred to your account after 24 hours. Any report submitted by buyers will place transfers on hold.
        </span>
      </div>
    </div>
  );
}
