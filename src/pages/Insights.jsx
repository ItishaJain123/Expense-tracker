import { useState, useMemo } from "react";
import moment from "moment";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useTransactions } from "../hooks/useTransactions";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../constants";
import * as XLSX from "xlsx";

const TOOLTIP_STYLE = {
  backgroundColor: "#F1F5F9",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  borderRadius: "8px",
};
const PIE_COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#06b6d4","#f97316","#14b8a6","#64748b"];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const m = moment().subtract(i, "months");
  return { label: m.format("MMMM YYYY"), value: m.format("YYYY-MM") };
});
const fmt = (v) => `₹${Number(v).toLocaleString("en-IN")}`;
const Empty = ({ msg = "Not enough data yet" }) => (
  <div className="flex items-center justify-center h-[260px]">
    <p className="text-gray-500 text-sm">{msg}</p>
  </div>
);

// ─── TRENDS TAB ────────────────────────────────────────────────────────────────
const TrendsTab = ({ transactions, sortedTransactions, income, expense, loading }) => {
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
    return Object.values(map).slice(-6).map((d) => ({ ...d, savings: d.income - d.expense }));
  }, [sortedTransactions]);

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
  const maxTop = top5[0]?.value || 1;
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const thisMonth = moment().format("MMM YY");
  const lastMonth = moment().subtract(1, "month").format("MMM YY");
  const thisExp = sortedTransactions.filter((t) => t.type === "expense" && moment(t.date, ["D MMMM YYYY","YYYY-MM-DD"]).format("MMM YY") === thisMonth).reduce((s, t) => s + Number(t.amount), 0);
  const lastExp = sortedTransactions.filter((t) => t.type === "expense" && moment(t.date, ["D MMMM YYYY","YYYY-MM-DD"]).format("MMM YY") === lastMonth).reduce((s, t) => s + Number(t.amount), 0);
  const monthChange = lastExp > 0 ? Math.round(((thisExp - lastExp) / lastExp) * 100) : 0;
  const avgTx = transactions.length > 0 ? Math.round((income + expense) / transactions.length) : 0;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Savings Rate", value: `${savingsRate}%`, color: savingsRate >= 20 ? "text-emerald-600" : savingsRate >= 0 ? "text-yellow-500" : "text-red-600", sub: "of total income saved" },
          { label: "vs Last Month", value: `${monthChange > 0 ? "+" : ""}${monthChange}%`, color: monthChange <= 0 ? "text-emerald-600" : "text-red-600", sub: "expense change" },
          { label: "Avg Transaction", value: `₹${avgTx.toLocaleString("en-IN")}`, color: "text-blue-700", sub: `across ${transactions.length} entries` },
          { label: "Net Savings", value: `₹${(income - expense).toLocaleString("en-IN")}`, color: income - expense >= 0 ? "text-emerald-600" : "text-red-600", sub: "income − expense" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">📈 Monthly Trend — Last 6 Months</h3>
        {monthlyData.length < 2 ? <Empty msg="Add transactions across multiple months to see trends" /> : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
              <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />
              <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: "#ef4444", r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="savings" name="Savings" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: "#6366f1", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">🥧 Expense by Category</h3>
          {expenseByCategory.length === 0 ? <Empty msg="No expense data yet" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3}>
                  {expenseByCategory.map((e, i) => <Cell key={i} fill={CATEGORY_COLORS[e.name] || `hsl(${i * 40},70%,60%)`} />)}
                </Pie>
                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">🏆 Top Spending Categories</h3>
          {top5.length === 0 ? <Empty msg="No expense data yet" /> : (
            <div className="space-y-5 mt-2">
              {top5.map(({ name, value }, i) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[name] || `hsl(${i * 40},70%,60%)` }} />
                      <span className="text-gray-700 text-sm font-medium">{name}</span>
                    </div>
                    <span className="text-gray-600 text-sm">₹{value.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / maxTop) * 100}%`, backgroundColor: CATEGORY_COLORS[name] || `hsl(${i * 40},70%,60%)` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-5 uppercase tracking-wide">📊 Income vs Expense by Month</h3>
        {monthlyData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
              <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
};

// ─── MONTHLY REPORT TAB ────────────────────────────────────────────────────────
const ReportTab = ({ sortedTransactions }) => {
  const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTIONS[0].value);

  const monthTx = useMemo(
    () => sortedTransactions.filter((t) => { const m = moment(t.date, ["D MMMM YYYY","YYYY-MM-DD"]); return m.isValid() && m.format("YYYY-MM") === selectedMonth; }),
    [sortedTransactions, selectedMonth]
  );

  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const savings = income - expense;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : "0.0";

  const expByCat = useMemo(() => {
    const map = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => { const c = t.category || "Other"; map[c] = (map[c] || 0) + Number(t.amount); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [monthTx]);

  const incByCat = useMemo(() => {
    const map = {};
    monthTx.filter((t) => t.type === "income").forEach((t) => { const c = t.category || "Other"; map[c] = (map[c] || 0) + Number(t.amount); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [monthTx]);

  const trendData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const m = moment().subtract(5 - i, "months");
      const key = m.format("YYYY-MM");
      const txns = sortedTransactions.filter((t) => { const d = moment(t.date, ["D MMMM YYYY","YYYY-MM-DD"]); return d.isValid() && d.format("YYYY-MM") === key; });
      const inc = txns.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const exp = txns.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      return { month: m.format("MMM"), income: inc, expense: exp, savings: inc - exp };
    }),
    [sortedTransactions]
  );

  const exportReport = () => {
    const rows = monthTx.map((t) => ({ Date: t.date, Type: t.type, Category: t.category || "Other", Name: t.name, Amount: Number(t.amount) }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Report_${selectedMonth}.xlsx`);
  };

  const selectedLabel = MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <p className="text-gray-600 text-sm">Monthly financial summary</p>
        <div className="flex items-center gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 text-sm">
            {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={exportReport} className="bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-400 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm cursor-pointer">↓ Export</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Income", value: `₹${income.toLocaleString("en-IN")}`, color: "text-emerald-600" },
          { label: "Expenses", value: `₹${expense.toLocaleString("en-IN")}`, color: "text-red-600" },
          { label: "Savings", value: `₹${savings.toLocaleString("en-IN")}`, color: savings >= 0 ? "text-blue-700" : "text-red-600" },
          { label: "Savings Rate", value: `${savingsRate}%`, color: Number(savingsRate) >= 20 ? "text-emerald-600" : Number(savingsRate) >= 0 ? "text-yellow-500" : "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {monthTx.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-6xl">📄</span>
          <h2 className="text-lg font-bold text-gray-900">No transactions in {selectedLabel}</h2>
          <p className="text-gray-600 text-sm">Try selecting a different month.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {[
              { title: "Expense Breakdown", data: expByCat, total: expense },
              { title: "Income Breakdown", data: incByCat, total: income },
            ].map(({ title, data, total }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5">
                <h2 className="text-gray-900 font-semibold text-base mb-4">{title}</h2>
                {data.length === 0 ? <p className="text-gray-500 text-sm text-center py-12">No data this month</p> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                        {data.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[data[i].name] || PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} />
                      <Legend formatter={(v) => <span style={{ color: "#6b7280", fontSize: "12px" }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <h2 className="text-gray-900 font-semibold text-base mb-4">6-Month Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" name="Savings" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {expByCat.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h2 className="text-gray-900 font-semibold text-base mb-4">Top Expense Categories</h2>
                <div className="space-y-3">
                  {expByCat.slice(0, 6).map((cat) => {
                    const pct = expense > 0 ? (cat.value / expense) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{CATEGORY_ICONS[cat.name] || "📦"}</span>
                            <span className="text-gray-700 text-sm">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-900 text-sm font-medium">₹{cat.value.toLocaleString("en-IN")}</span>
                            <span className="text-gray-500 text-xs ml-2">{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat.name] || "#6366f1" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {incByCat.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h2 className="text-gray-900 font-semibold text-base mb-4">Income Sources</h2>
                <div className="space-y-3">
                  {incByCat.slice(0, 6).map((cat) => {
                    const pct = income > 0 ? (cat.value / income) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{CATEGORY_ICONS[cat.name] || "📦"}</span>
                            <span className="text-gray-700 text-sm">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-900 text-sm font-medium">₹{cat.value.toLocaleString("en-IN")}</span>
                            <span className="text-gray-500 text-xs ml-2">{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat.name] || "#10b981" }} />
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
    </>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
const TABS = ["Trends", "Monthly Report"];

const Insights = () => {
  const [activeTab, setActiveTab] = useState("Trends");
  const { transactions, sortedTransactions, loading, income, expense } = useTransactions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
        <p className="text-gray-600 mt-1 text-sm">Analytics trends and monthly reports in one place</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "Trends" ? "📈 Trends" : "📄 Monthly Report"}
          </button>
        ))}
      </div>

      {activeTab === "Trends" ? (
        <TrendsTab transactions={transactions} sortedTransactions={sortedTransactions} income={income} expense={expense} loading={loading} />
      ) : (
        <ReportTab sortedTransactions={sortedTransactions} />
      )}
    </div>
  );
};

export default Insights;
