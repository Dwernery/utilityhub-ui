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

export function Graph({ selectedYear }) {
  const { data: netWorthHistory } = useNetWorthHistory();
  const fmtY = (v) => "$" + Math.floor(v / 1000) + "k";

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-2xl transition-all duration-300">
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={getMonthlyChartData(netWorthHistory, selectedYear)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={"month"} stroke="#64748b" />
          <YAxis
            stroke="#64748b"
            tickFormatter={fmtY}
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
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
