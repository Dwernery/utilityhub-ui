import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { currencyFormatter } from "../utils/currency";
import { BREAKPOINTS, useMediaQuery } from "../../../lib/useMediaQuery";

const SELECTED = "#059669"; // emerald-600, the page's accent
const OTHER = "#a7f3d0"; // emerald-200

const fmtThousands = (v) => "$" + Math.round(v / 1000) + "k";

/**
 * Total income for every year, with the selected year highlighted. Clicking a
 * bar selects its year. Mirrors utility-hub-mobile's "Income by year" chart.
 *
 * @param {{ data: { year: number, total: number }[], selectedYear: number,
 *   onSelectYear: (year: number) => void }} props
 */
export function IncomeByYearChart({ data, selectedYear, onSelectYear }) {
  const isPhone = !useMediaQuery(BREAKPOINTS.md);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Income by Year</h2>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: isPhone ? -15 : 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              tick={{ fontSize: isPhone ? 11 : 12 }}
            />
            <YAxis
              stroke="#64748b"
              tickFormatter={fmtThousands}
              tick={{ fontSize: isPhone ? 11 : 12 }}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#1e293b",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)",
              }}
              formatter={(v) => [currencyFormatter.format(v), "Income"]}
            />
            <Bar
              dataKey="total"
              radius={[6, 6, 0, 0]}
              className="hover:cursor-pointer"
              onClick={(bar) => {
                const year = bar.payload?.year;
                if (year != null) onSelectYear(year);
              }}
            >
              {data.map((d) => (
                <Cell
                  key={d.year}
                  fill={d.year === selectedYear ? SELECTED : OTHER}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
