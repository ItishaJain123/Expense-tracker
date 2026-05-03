import { useMemo } from "react";
import moment from "moment";
import {
  LineChart,
  Line,
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
import { useTransactions } from "../hooks/useTransactions";
import { CATEGORY_COLORS } from "../constants";

const TOOLTIP_STYLE = {
  backgroundColor: "#F1F5F9",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  borderRadius: "8px",
};

const EmptyChart = ({ message = "Not enough data yet" }) => (
  <div className="flex items-center justify-center h-[280px]">
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);

const Analytics = () => {
  const { transactions, sortedTransactions, loading, income, expense } =
    useTransactions();

  const tooltipFormatter = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

  // Last 6 months trend
  const monthlyData = useMemo(() => {
    const map = {};
    [...sortedTransactions].reverse().forEach((t) => {
      const m = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
      if (!m.isValid()) return;
      const key = m.format("MMM YY");
      if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
      if (t.type === "income") map[key].income += Number(t.amount);
      else map[key].expense += Number(t.amount);
    });
    return Object.values(map)
      .slice(-6)
      .map((d) => ({ ...d, savings: d.income - d.expense }));
  }, [sortedTransactions]);

  // Expense by category
  const expenseByCategory = useMemo(
    () =>
      sortedTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => {
          const key = t.category || t.name;
          const ex = acc.find((x) => x.name === key);
          if (ex) ex.value += Number(t.amount);
          else acc.push({ name: key, value: Number(t.amount) });
          return acc;
        }, [])
        .sort((a, b) => b.value - a.value),
    [sortedTransactions]
  );

  const top5 = expenseByCategory.slice(0, 5);
  const maxTopVal = top5[0]?.value || 1;

  // Key stats
  const savingsRate =
    income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

  const thisMonth = moment().format("MMM YY");
  const lastMonth = moment().subtract(1, "month").format("MMM YY");

  const thisMonthExpense = sortedTransactions
    .filter(
      (t) =>
        t.type === "expense" &&
        moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]).format("MMM YY") ===
          thisMonth
    )
    .reduce((s, t) => s + Number(t.amount), 0);

  const lastMonthExpense = sortedTransactions
    .filter(
      (t) =>
        t.type === "expense" &&
        moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]).format("MMM YY") ===
          lastMonth
    )
    .reduce((s, t) => s + Number(t.amount), 0);

  const monthChange =
    lastMonthExpense > 0
      ? Math.round(
          ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100
        )
      : 0;

  const totalTransactions = transactions.length;
  const avgTransaction =
    totalTransactions > 0
      ? Math.round((income + expense) / totalTransactions)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Deep insights into your financial patterns
        </p>
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">
            Savings Rate
          </p>
          <p
            className={`text-3xl font-bold ${
              savingsRate >= 20
                ? "text-emerald-600"
                : savingsRate >= 0
                ? "text-yellow-400"
                : "text-red-600"
            }`}
          >
            {savingsRate}%
          </p>
          <p className="text-gray-500 text-xs mt-1">of total income saved</p>
        </div>

        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">
            vs Last Month
          </p>
          <p
            className={`text-3xl font-bold ${
              monthChange <= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {monthChange > 0 ? "+" : ""}
            {monthChange}%
          </p>
          <p className="text-gray-500 text-xs mt-1">expense change</p>
        </div>

        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">
            Avg Transaction
          </p>
          <p className="text-3xl font-bold text-blue-700">
            ₹{avgTransaction.toLocaleString("en-IN")}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            across {totalTransactions} entries
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">
            Net Savings
          </p>
          <p
            className={`text-3xl font-bold ${
              income - expense >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            ₹{(income - expense).toLocaleString("en-IN")}
          </p>
          <p className="text-gray-500 text-xs mt-1">income − expense</p>
        </div>
      </div>

      {/* Monthly trend line chart */}
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">
          📈 Monthly Trend — Last 6 Months
        </h3>
        {monthlyData.length < 2 ? (
          <EmptyChart message="Add transactions across multiple months to see trends" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={monthlyData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={tooltipFormatter}
              />
              <Legend
                wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="savings"
                name="Savings"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ fill: "#6366f1", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row: Pie + Top categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Expense by category pie */}
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">
            🥧 Expense by Category
          </h3>
          {expenseByCategory.length === 0 ? (
            <EmptyChart message="No expense data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {expenseByCategory.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        CATEGORY_COLORS[entry.name] ||
                        `hsl(${i * 40}, 70%, 60%)`
                      }
                    />
                  ))}
                </Pie>
                <Legend
                  wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [
                    `₹${Number(v).toLocaleString("en-IN")}`,
                    "Amount",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 5 spending categories */}
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">
            🏆 Top Spending Categories
          </h3>
          {top5.length === 0 ? (
            <EmptyChart message="No expense data yet" />
          ) : (
            <div className="space-y-5 mt-2">
              {top5.map(({ name, value }, i) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[name] ||
                            `hsl(${i * 40}, 70%, 60%)`,
                        }}
                      />
                      <span className="text-gray-300 text-sm font-medium">
                        {name}
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      ₹{value.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(value / maxTopVal) * 100}%`,
                        backgroundColor:
                          CATEGORY_COLORS[name] ||
                          `hsl(${i * 40}, 70%, 60%)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Income vs Expense bar chart */}
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">
          📊 Income vs Expense by Month
        </h3>
        {monthlyData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
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
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={tooltipFormatter}
              />
              <Legend
                wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }}
              />
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
  );
};

export default Analytics;
