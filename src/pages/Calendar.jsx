import { useState, useMemo } from "react";
import moment from "moment";
import { useTransactions } from "../hooks/useTransactions";

const Calendar = () => {
  const { transactions, loading } = useTransactions();
  const [currentMonth, setCurrentMonth] = useState(moment().startOf("month"));
  const [selectedDay, setSelectedDay] = useState(null);

  const dailyMap = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const m = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
      if (!m.isValid()) return;
      const key = m.format("YYYY-MM-DD");
      if (!map[key]) map[key] = { expense: 0, income: 0 };
      if (t.type === "expense") map[key].expense += Number(t.amount);
      else map[key].income += Number(t.amount);
    });
    return map;
  }, [transactions]);

  const monthDays = useMemo(() => {
    const start = currentMonth.clone().startOf("month");
    const end = currentMonth.clone().endOf("month");
    const days = [];
    let d = start.clone();
    while (d.isSameOrBefore(end)) {
      days.push(d.clone());
      d.add(1, "day");
    }
    return days;
  }, [currentMonth]);

  const maxExpense = useMemo(
    () => Math.max(...monthDays.map((d) => dailyMap[d.format("YYYY-MM-DD")]?.expense || 0), 1),
    [monthDays, dailyMap]
  );

  const startOffset = currentMonth.clone().startOf("month").day();

  const monthTotal = monthDays.reduce((s, d) => s + (dailyMap[d.format("YYYY-MM-DD")]?.expense || 0), 0);
  const spendDays = monthDays.filter((d) => (dailyMap[d.format("YYYY-MM-DD")]?.expense || 0) > 0).length;
  const avgPerDay = spendDays > 0 ? Math.round(monthTotal / spendDays) : 0;
  const highestEntry = monthDays.reduce(
    (max, d) => {
      const amt = dailyMap[d.format("YYYY-MM-DD")]?.expense || 0;
      return amt > max.amt ? { day: d, amt } : max;
    },
    { day: null, amt: 0 }
  );

  const dayTransactions = useMemo(() => {
    if (!selectedDay) return [];
    return transactions
      .filter((t) => {
        const m = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
        return m.isValid() && m.format("YYYY-MM-DD") === selectedDay;
      })
      .sort((a, b) => (a.type === "income" ? 1 : -1));
  }, [transactions, selectedDay]);

  const getCellStyle = (amount) => {
    if (!amount) return "bg-gray-50 border-gray-100 hover:bg-gray-100";
    const pct = amount / maxExpense;
    if (pct < 0.25) return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
    if (pct < 0.5) return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
    if (pct < 0.75) return "bg-orange-50 border-orange-200 hover:bg-orange-100";
    return "bg-red-50 border-red-200 hover:bg-red-100";
  };

  const getAmtColor = (amount) => {
    if (!amount) return "text-gray-300";
    const pct = amount / maxExpense;
    if (pct < 0.25) return "text-emerald-600";
    if (pct < 0.5) return "text-yellow-600";
    if (pct < 0.75) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Spending Calendar</h1>
          <p className="text-gray-600 mt-1 text-sm">Daily expense heatmap — click any day to inspect</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setCurrentMonth((m) => m.clone().subtract(1, "month")); setSelectedDay(null); }}
            className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 text-lg flex items-center justify-center"
          >
            ‹
          </button>
          <span className="text-gray-900 font-semibold min-w-[140px] text-center">
            {currentMonth.format("MMMM YYYY")}
          </span>
          <button
            onClick={() => { setCurrentMonth((m) => m.clone().add(1, "month")); setSelectedDay(null); }}
            className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 text-lg flex items-center justify-center"
          >
            ›
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Spent", value: `₹${monthTotal.toLocaleString("en-IN")}`, color: "text-red-600" },
          { label: "Avg per Spend Day", value: `₹${avgPerDay.toLocaleString("en-IN")}`, color: "text-orange-500" },
          { label: "Days with Spending", value: spendDays, color: "text-blue-600" },
          {
            label: "Highest Day",
            value: highestEntry.amt ? `₹${highestEntry.amt.toLocaleString("en-IN")}` : "—",
            sub: highestEntry.day ? highestEntry.day.format("D MMM") : "",
            color: "text-red-600",
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-7 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
            {monthDays.map((day) => {
              const key = day.format("YYYY-MM-DD");
              const expense = dailyMap[key]?.expense || 0;
              const isSelected = selectedDay === key;
              const isToday = day.isSame(moment(), "day");
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  className={`relative rounded-xl border p-1.5 min-h-[54px] flex flex-col items-center justify-start transition-all cursor-pointer ${getCellStyle(expense)} ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                    {day.date()}
                  </span>
                  {expense > 0 && (
                    <span className={`text-[10px] font-semibold mt-0.5 leading-tight ${getAmtColor(expense)}`}>
                      {expense >= 1000 ? `₹${(expense / 1000).toFixed(1)}k` : `₹${expense}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Legend:</span>
            {[
              { label: "No spend", cls: "bg-gray-100" },
              { label: "Low", cls: "bg-emerald-100" },
              { label: "Medium", cls: "bg-yellow-100" },
              { label: "High", cls: "bg-orange-100" },
              { label: "Max", cls: "bg-red-100" },
            ].map(({ label, cls }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${cls} border border-gray-200`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          {selectedDay ? (
            <>
              <h3 className="text-base font-bold text-gray-900">{moment(selectedDay).format("dddd")}</h3>
              <p className="text-sm text-gray-500 mb-4">{moment(selectedDay).format("D MMMM YYYY")}</p>
              {dayTransactions.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <span className="text-4xl">✅</span>
                  <p className="text-gray-500 text-sm">No transactions this day</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {dayTransactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-900 text-sm font-medium truncate">{t.name}</p>
                          <p className="text-gray-500 text-xs">{t.category || "—"}</p>
                        </div>
                        <span className={`font-bold text-sm ml-3 flex-shrink-0 ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                          {t.type === "income" ? "+" : "-"}₹{Number(t.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                    {dayTransactions.filter((t) => t.type === "expense").length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Expense</span>
                        <span className="font-bold text-red-600">
                          -₹{dayTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {dayTransactions.filter((t) => t.type === "income").length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Income</span>
                        <span className="font-bold text-emerald-600">
                          +₹{dayTransactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center py-16 gap-3">
              <span className="text-5xl">📅</span>
              <p className="text-gray-500 text-sm text-center">Click any day on the calendar to see its transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
