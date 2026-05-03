import { useState, useMemo } from "react";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useTransactions } from "../hooks/useTransactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from "../constants";
import * as XLSX from "xlsx";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const m = moment().subtract(i, "months");
  return { label: m.format("MMMM YYYY"), value: m.format("YYYY-MM") };
});

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#06b6d4", "#f97316", "#14b8a6", "#64748b"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#F1F5F9] border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-900 font-semibold">{payload[0].name}</p>
      <p className="text-gray-300">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
    </div>
  );
};

const Reports = () => {
  const { sortedTransactions, loading } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTIONS[0].value);

  const monthTransactions = useMemo(() =>
    sortedTransactions.filter((t) => {
      const m = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
      return m.isValid() && m.format("YYYY-MM") === selectedMonth;
    }),
    [sortedTransactions, selectedMonth]
  );

  const income = monthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = monthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const savings = income - expense;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : "0.0";

  // Category breakdown for expenses
  const expenseByCategory = useMemo(() => {
    const map = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category || "Other";
        map[cat] = (map[cat] || 0) + Number(t.amount);
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [monthTransactions]);

  // Category breakdown for income
  const incomeByCategory = useMemo(() => {
    const map = {};
    monthTransactions
      .filter((t) => t.type === "income")
      .forEach((t) => {
        const cat = t.category || "Other";
        map[cat] = (map[cat] || 0) + Number(t.amount);
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [monthTransactions]);

  // Last 6 months trend
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = moment().subtract(5 - i, "months");
      const key = m.format("YYYY-MM");
      const txns = sortedTransactions.filter((t) => {
        const d = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
        return d.isValid() && d.format("YYYY-MM") === key;
      });
      const inc = txns.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const exp = txns.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      return { month: m.format("MMM"), income: inc, expense: exp, savings: inc - exp };
    });
  }, [sortedTransactions]);

  const exportReport = () => {
    const rows = monthTransactions.map((t) => ({
      Date: t.date,
      Type: t.type,
      Category: t.category || "Other",
      Name: t.name,
      Amount: Number(t.amount),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Report_${selectedMonth}.xlsx`);
  };

  const selectedLabel = MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1 text-sm">Monthly financial summary</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#F1F5F9] border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 transition-colors text-sm"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button
            onClick={exportReport}
            className="bg-[#F1F5F9] border border-gray-200 text-gray-300 hover:text-gray-900 hover:border-gray-500 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
          >
            ↓ Export
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Income</p>
          <p className="text-xl font-bold text-emerald-600">₹{income.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Expenses</p>
          <p className="text-xl font-bold text-red-600">₹{expense.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Savings</p>
          <p className={`text-xl font-bold ${savings >= 0 ? "text-blue-700" : "text-red-600"}`}>
            ₹{savings.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Savings Rate</p>
          <p className={`text-xl font-bold ${Number(savingsRate) >= 20 ? "text-emerald-600" : Number(savingsRate) >= 0 ? "text-yellow-400" : "text-red-600"}`}>
            {savingsRate}%
          </p>
        </div>
      </div>

      {monthTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-6xl">📄</span>
          <h2 className="text-lg font-bold text-gray-900">No transactions in {selectedLabel}</h2>
          <p className="text-gray-600 text-sm">Try selecting a different month.</p>
        </div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Expense breakdown pie */}
            <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
              <h2 className="text-gray-900 font-semibold text-base mb-4">Expense Breakdown</h2>
              {expenseByCategory.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-12">No expenses this month</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseByCategory.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CATEGORY_COLORS[expenseByCategory[i].name] || PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ color: "#9ca3af", fontSize: "12px" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Income breakdown pie */}
            <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
              <h2 className="text-gray-900 font-semibold text-base mb-4">Income Breakdown</h2>
              {incomeByCategory.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-12">No income this month</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={incomeByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {incomeByCategory.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CATEGORY_COLORS[incomeByCategory[i].name] || PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ color: "#9ca3af", fontSize: "12px" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 6-month trend */}
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5 mb-8">
            <h2 className="text-gray-900 font-semibold text-base mb-4">6-Month Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" name="Savings" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category detail table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense categories */}
            {expenseByCategory.length > 0 && (
              <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
                <h2 className="text-gray-900 font-semibold text-base mb-4">Top Expense Categories</h2>
                <div className="space-y-3">
                  {expenseByCategory.slice(0, 6).map((cat) => {
                    const pct = expense > 0 ? (cat.value / expense) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{CATEGORY_ICONS[cat.name] || "📦"}</span>
                            <span className="text-gray-300 text-sm">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-900 text-sm font-medium">
                              ₹{cat.value.toLocaleString("en-IN")}
                            </span>
                            <span className="text-gray-500 text-xs ml-2">{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: CATEGORY_COLORS[cat.name] || "#6366f1",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Income categories */}
            {incomeByCategory.length > 0 && (
              <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
                <h2 className="text-gray-900 font-semibold text-base mb-4">Income Sources</h2>
                <div className="space-y-3">
                  {incomeByCategory.slice(0, 6).map((cat) => {
                    const pct = income > 0 ? (cat.value / income) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{CATEGORY_ICONS[cat.name] || "📦"}</span>
                            <span className="text-gray-300 text-sm">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-900 text-sm font-medium">
                              ₹{cat.value.toLocaleString("en-IN")}
                            </span>
                            <span className="text-gray-500 text-xs ml-2">{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: CATEGORY_COLORS[cat.name] || "#10b981",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
