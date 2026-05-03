import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { MdEdit, MdDelete } from "react-icons/md";
import { useTransactions } from "../hooks/useTransactions";
import { useBudgets } from "../hooks/useBudgets";
import Cards from "../components/Cards";
import AddExpense from "../components/Modals/AddExpense";
import AddIncome from "../components/Modals/AddIncome";
import EditModal from "../components/Modals/EditModal";
import DeleteConfirmationModal from "../components/Modals/DeleteConfirmationModal";
import ResetConfirmationModal from "../components/Modals/ResetConfirmationModal";
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from "../constants";

const InsightsCard = ({ transactions, budgets }) => {
  const thisMonth = moment().format("MMM YY");
  const lastMonth = moment().subtract(1, "month").format("MMM YY");

  const spendingByMonth = (monthKey) =>
    transactions
      .filter((t) => {
        const m = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
        return t.type === "expense" && m.isValid() && m.format("MMM YY") === monthKey;
      })
      .reduce((acc, t) => {
        const cat = t.category || "Other";
        acc[cat] = (acc[cat] || 0) + Number(t.amount);
        return acc;
      }, {});

  const thisSpending = spendingByMonth(thisMonth);
  const lastSpending = spendingByMonth(lastMonth);

  const insights = [];

  // Budget savings: spent less than limit → highlight the saving
  Object.entries(budgets).forEach(([cat, limit]) => {
    const spent = thisSpending[cat] || 0;
    const saved = limit - spent;
    if (saved > 0 && limit > 0) {
      insights.push({
        emoji: "🎉",
        message: `You saved ₹${saved.toLocaleString("en-IN")} on ${cat} this month! Keep it up.`,
        color: "emerald",
      });
    }
  });

  // Category vs last month: down is good, up is a warning
  Object.entries(thisSpending).forEach(([cat, thisAmt]) => {
    const lastAmt = lastSpending[cat] || 0;
    if (lastAmt === 0) return;
    const diff = thisAmt - lastAmt;
    const pct = Math.round(Math.abs((diff / lastAmt) * 100));
    if (diff < 0 && Math.abs(diff) >= 300) {
      insights.push({
        emoji: "📉",
        message: `${cat} spending dropped by ₹${Math.abs(diff).toLocaleString("en-IN")} (${pct}%) vs last month.`,
        color: "emerald",
      });
    } else if (diff > 0 && pct >= 25) {
      insights.push({
        emoji: "⚠️",
        message: `${cat} spending rose ${pct}% compared to last month.`,
        color: "yellow",
      });
    }
  });

  if (insights.length === 0) {
    insights.push({
      emoji: "💡",
      message: "Add transactions and set budgets to see personalised spending insights here.",
      color: "blue",
    });
  }

  const colorMap = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-800",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-800",
    blue: "bg-blue-50 border-blue-100 text-blue-800",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        💡 Spending Insights
        <span className="text-xs font-normal text-gray-500 ml-1">
          {moment().format("MMMM YYYY")}
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.slice(0, 6).map((insight, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-xl border ${colorMap[insight.color]}`}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{insight.emoji}</span>
            <p className="text-sm leading-snug">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const {
    user,
    transactions,
    sortedTransactions,
    loading,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    resetAllTransactions,
    income,
    expense,
    balance,
  } = useTransactions();

  const { budgets, loading: budgetLoading } = useBudgets();
  const alertedRef = useRef(false);

  // Fire budget alerts once after both data sources load
  useEffect(() => {
    if (loading || budgetLoading || alertedRef.current) return;
    if (!Object.keys(budgets).length) return;
    alertedRef.current = true;

    const thisMonth = moment().format("MMM YY");
    const spending = transactions
      .filter((t) => {
        const m = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
        return t.type === "expense" && m.isValid() && m.format("MMM YY") === thisMonth;
      })
      .reduce((acc, t) => {
        const cat = t.category || "Other";
        acc[cat] = (acc[cat] || 0) + Number(t.amount);
        return acc;
      }, {});

    EXPENSE_CATEGORIES.forEach((cat) => {
      const limit = budgets[cat];
      if (!limit) return;
      const spent = spending[cat] || 0;
      const pct = (spent / limit) * 100;
      if (pct >= 100) {
        toast.error(
          `🚨 ${cat} budget exceeded! ₹${spent.toLocaleString("en-IN")} of ₹${limit.toLocaleString("en-IN")}`,
          { toastId: `over-${cat}`, autoClose: 6000 }
        );
      } else if (pct >= 75) {
        toast.warning(
          `⚠️ ${cat} is at ${pct.toFixed(0)}% — ₹${(limit - spent).toLocaleString("en-IN")} left`,
          { toastId: `warn-${cat}`, autoClose: 5000 }
        );
      }
    });
  }, [loading, budgetLoading, budgets, transactions]);

  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // This month stats
  const thisMonthKey = moment().format("MMM YY");
  const thisMonthTx = transactions.filter((t) => {
    const m = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
    return m.isValid() && m.format("MMM YY") === thisMonthKey;
  });
  const thisMonthIncome = thisMonthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const thisMonthExpense = thisMonthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const savingsRate =
    thisMonthIncome > 0
      ? Math.round(((thisMonthIncome - thisMonthExpense) / thisMonthIncome) * 100)
      : 0;

  const recentTransactions = sortedTransactions.slice(0, 5);

  const checkBudgetAfterExpense = (category, newAmount) => {
    const limit = budgets[category];
    if (!limit) return;
    const thisMonth = moment().format("MMM YY");
    const prevSpent = transactions
      .filter((t) => {
        const m = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
        return (
          t.type === "expense" &&
          (t.category || "Other") === category &&
          m.isValid() &&
          m.format("MMM YY") === thisMonth
        );
      })
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalSpent = prevSpent + Number(newAmount);
    const pct = (totalSpent / limit) * 100;
    if (totalSpent >= limit) {
      toast.error(
        `🚨 ${category} budget exceeded! ₹${totalSpent.toLocaleString("en-IN")} of ₹${limit.toLocaleString("en-IN")}`,
        { toastId: `over-${category}`, autoClose: 6000 }
      );
    } else if (pct >= 75) {
      toast.warning(
        `⚠️ ${category} is now at ${pct.toFixed(0)}% — ₹${(limit - totalSpent).toLocaleString("en-IN")} remaining`,
        { toastId: `warn-${category}`, autoClose: 5000 }
      );
    }
  };

  const onFinish = async (values, type) => {
    const newTransaction = {
      name: values.name,
      amount: Number(values.amount),
      date: values.date ? values.date.format("D MMMM YYYY") : null,
      type,
      category: values.category || "Other",
    };
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    await addTransaction(newTransaction);
    await fetchTransactions();
    if (type === "expense") {
      checkBudgetAfterExpense(newTransaction.category, newTransaction.amount);
    }
  };

  const confirmDelete = async () => {
    if (!selectedTransaction?.id) return;
    try {
      await deleteTransaction(selectedTransaction.id);
      await fetchTransactions();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      await updateTransaction(selectedTransaction.id, {
        ...values,
        date: values.date.format("D MMMM YYYY"),
      });
      await fetchTransactions();
      setEditModalVisible(false);
      setSelectedTransaction(null);
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleResetConfirm = async () => {
    try {
      await resetAllTransactions();
      await fetchTransactions();
      toast.success("All data reset!");
      setResetModalVisible(false);
    } catch {
      toast.error("Reset failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
            {user?.displayName || user?.email?.split("@")[0]} 👋
          </span>
        </h1>
        <p className="text-gray-600 mt-1 text-sm">
          {moment().format("dddd, D MMMM YYYY")}
        </p>
      </div>

      {/* Balance Cards */}
      <Cards
        currentBalance={balance}
        income={income}
        expense={expense}
        showExpenseModal={() => setIsExpenseModalVisible(true)}
        showIncomeModal={() => setIsIncomeModalVisible(true)}
        showResetModal={() => setResetModalVisible(true)}
      />

      {/* This month quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">
            This Month Income
          </p>
          <p className="text-2xl font-bold text-emerald-600">
            ₹{thisMonthIncome.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">
            This Month Expense
          </p>
          <p className="text-2xl font-bold text-red-600">
            ₹{thisMonthExpense.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">
            Savings Rate
          </p>
          <p
            className={`text-2xl font-bold ${
              savingsRate >= 20
                ? "text-emerald-600"
                : savingsRate >= 0
                ? "text-yellow-400"
                : "text-red-600"
            }`}
          >
            {savingsRate}%
          </p>
        </div>
      </div>

      {/* Spending Insights */}
      <InsightsCard transactions={transactions} budgets={budgets} />

      {/* Recent Transactions */}
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <Link
            to="/app/transactions"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span className="text-5xl">💸</span>
            <p className="text-gray-600 text-sm">No transactions yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 bg-[#F1F5F9] rounded-xl hover:bg-[#E8EEF4] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[t.category] || "#6366f1"}25`,
                    }}
                  >
                    {t.type === "income" ? "📈" : "📉"}
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{t.name}</p>
                    <p className="text-gray-500 text-xs">
                      {t.category || "—"} · {t.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold text-sm ${
                      t.type === "income" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}₹
                    {Number(t.amount).toLocaleString("en-IN")}
                  </span>
                  <div className="flex gap-2">
                    <MdEdit
                      className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
                      onClick={() => {
                        setSelectedTransaction(t);
                        setEditModalVisible(true);
                      }}
                    />
                    <MdDelete
                      className="text-red-600 cursor-pointer hover:text-red-700 transition-colors"
                      onClick={() => {
                        setSelectedTransaction({ id: t.id, name: t.name });
                        setDeleteModalVisible(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddIncome
        isIncomeModalVisible={isIncomeModalVisible}
        handleIncomeCancel={() => setIsIncomeModalVisible(false)}
        onFinish={onFinish}
      />
      <AddExpense
        isExpenseModalVisible={isExpenseModalVisible}
        handleExpenseCancel={() => setIsExpenseModalVisible(false)}
        onFinish={onFinish}
      />
      <EditModal
        editModalVisible={editModalVisible}
        handleEditCancel={() => setEditModalVisible(false)}
        transaction={selectedTransaction}
        handleUpdate={handleUpdate}
      />
      <DeleteConfirmationModal
        deleteModalVisible={deleteModalVisible}
        handleCancel={() => setDeleteModalVisible(false)}
        handleConfirm={confirmDelete}
        selectedTransaction={selectedTransaction}
      />
      <ResetConfirmationModal
        resetModalVisible={resetModalVisible}
        handleCancel={() => setResetModalVisible(false)}
        handleConfirm={handleResetConfirm}
      />
    </div>
  );
};

export default Dashboard;
