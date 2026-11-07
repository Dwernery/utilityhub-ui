import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getMonthlyChartData } from "../utils/metrics.js";
import { useNetWorthHistory } from "../hooks/useNetWorthHistory";
import { Currencyformatter } from "../utils/currency.js";
import { useState, useEffect } from "react";

export function Graph({ years, selectedYear, onSelectYear, flat = false }) {
  const { data: netWorthHistory } = useNetWorthHistory();
  const fmtY = (v) => "$" + Math.floor(v / 1000) + "k";
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showEveryOtherLabel = width < 1024;

  return (
    <div
      className={`flex flex-col h-full min-h-[200px] bg-white rounded-2xl sm:pt-4 ${
        flat ? "" : "border border-slate-200 shadow-xl"
      }`}
    >
      {years?.length > 1 && (
        <div className="flex flex-shrink-0 gap-1 md:gap-2 mb-4 pb-3 pl-4 overflow-x-auto border-b border-slate-100">
          {years?.map((year) => (
            <button
              key={year}
              onClick={() => onSelectYear(year)}
              className={`px-3 md:px-5 py-1.5 rounded-lg font-semibold text-xs md:text-sm transition-all whitespace-nowrap border ${selectedYear === year ? "bg-blue-600 text-white border-blue-600 shadow-lg" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 hover:cursor-pointer"}`}
            >
              {year}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={getMonthlyChartData(netWorthHistory, selectedYear)}
            margin={{
              top: 5,
              right: 20,
              left: width < 768 ? -15 : 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={"month"}
              stroke="#64748b"
              tick={{ fontSize: width < 768 ? 11 : 12 }}
              interval={showEveryOtherLabel ? 1 : 0}
              padding={{ right: 16 }}
            />
            <YAxis
              stroke="#64748b"
              tickFormatter={fmtY}
              tick={{ fontSize: width < 768 ? 11 : 12 }}
              domain={[
                (dataMin) => Math.floor(dataMin / 10000) * 10000,
                (dataMax) => Math.ceil(dataMax / 10000) * 10000,
              ]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#1e293b",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)",
              }}
              formatter={(v) => [Currencyformatter.format(v), "Net Worth"]}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="#3b82f6"
              strokeWidth={width < 768 ? 2 : 3}
              dot={{ fill: "#3b82f6", r: width < 768 ? 3 : 5 }}
              activeDot={{ r: width < 768 ? 5 : 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
