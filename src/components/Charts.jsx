import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import moment from "moment";
import { CATEGORY_COLORS } from "../constants";

const Charts = ({ sortedTransactions }) => {
  // Bug fix: pie chart now uses category (meaningful), not raw name
  // Bug fix: separate color arrays per chart so indices never go out of bounds
  const expenseByCategoryData = sortedTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => {
      const key = curr.category || curr.name;
      const existing = acc.find((item) => item.name === key);
      if (existing) {
        existing.value += Number(curr.amount);
      } else {
        acc.push({ name: key, value: Number(curr.amount) });
      }
      return acc;
    }, []);

  // Bug fix: use moment for reliable date parsing when grouping by month
  const monthlyData = [...sortedTransactions]
    .reverse()
    .reduce((acc, curr) => {
      const m = moment(curr.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
      const monthKey = m.isValid() ? m.format("MMM YY") : curr.date;
      const existing = acc.find((item) => item.month === monthKey);
      if (existing) {
        if (curr.type === "income") existing.income += Number(curr.amount);
        else existing.expense += Number(curr.amount);
      } else {
        acc.push({
          month: monthKey,
          income: curr.type === "income" ? Number(curr.amount) : 0,
          expense: curr.type === "expense" ? Number(curr.amount) : 0,
        });
      }
      return acc;
    }, []);

  const hasExpenses = expenseByCategoryData.length > 0;
  const hasData = sortedTransactions.length > 0;

  const tooltipStyle = {
    backgroundColor: "#F1F5F9",
    border: "1px solid #CBD5E1",
    color: "#0F172A",
    borderRadius: "8px",
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span className="inline-block w-1 h-7 bg-gradient-to-b from-blue-600 to-sky-500 rounded-full" />
        Analytics Overview
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie: expense by category */}
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">
            🥧 Expense by Category
          </h3>
          {!hasExpenses ? (
            <div className="flex items-center justify-center h-[280px]">
              <p className="text-gray-500 text-sm">No expense data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={expenseByCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {expenseByCategoryData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={
                        CATEGORY_COLORS[entry.name] ||
                        `hsl(${i * 40}, 70%, 60%)`
                      }
                    />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar: income vs expense by month */}
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">
            📊 Income vs Expense
          </h3>
          {!hasData ? (
            <div className="flex items-center justify-center h-[280px]">
              <p className="text-gray-500 text-sm">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                />
                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;
