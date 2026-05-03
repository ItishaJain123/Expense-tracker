import { useState } from "react";
import moment from "moment";
import { useTransactions } from "../hooks/useTransactions";
import { useBudgets } from "../hooks/useBudgets";
import { EXPENSE_CATEGORIES, CATEGORY_ICONS } from "../constants";

const CUSTOM_EMOJIS = [
  "📌","🏷️","💡","🎪","🎭","🛠️","🧹","🧴","🐾","🌿",
  "🍕","☕","🎂","🍺","🚀","⚽","🎵","📷","💎","🌍",
  "🏖️","🎁","🕹️","🧘","🚴","🏊","🎨","📖","🔧","💊",
];

const BudgetModal = ({ category, current, onSave, onClose }) => {
  const [value, setValue] = useState(current || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h3 className="text-gray-900 font-bold text-lg mb-1">
          {CATEGORY_ICONS[category] || "🏷️"} {category}
        </h3>
        <p className="text-gray-600 text-sm mb-5">Set monthly spending limit</p>
        <div className="mb-5">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">
            Monthly Limit (₹)
          </label>
          <input
            type="number"
            min={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 5000"
            autoFocus
            className="w-full bg-[#F1F5F9] border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors text-lg"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-500 transition-colors text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => value && Number(value) > 0 && onSave(Number(value))}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-sky-600 transition-all cursor-pointer"
          >
            Save Budget
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomCategoryModal = ({ onSave, onClose }) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📌");
  const [limit, setLimit] = useState("");

  const handleSave = () => {
    if (!name.trim() || !limit || Number(limit) <= 0) return;
    onSave({ name: name.trim(), emoji, limit: Number(limit) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-gray-900 font-bold text-xl mb-1">Create Custom Category</h3>
        <p className="text-gray-600 text-sm mb-5">Define your own spending category and set a monthly limit.</p>

        {/* Emoji picker */}
        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Pick an Icon</label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {CUSTOM_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                  emoji === e
                    ? "bg-blue-600/30 border border-blue-500/60"
                    : "bg-[#F1F5F9] border border-gray-200 hover:border-gray-500"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pet Care, Gym, Hobbies"
            maxLength={30}
            className="w-full bg-[#F1F5F9] border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Monthly Limit (₹)</label>
          <input
            type="number"
            min={1}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="e.g. 3000"
            className="w-full bg-[#F1F5F9] border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !limit || Number(limit) <= 0}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-sky-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
};

const BudgetCard = ({ category, icon, limit, spent, onEdit, onDelete }) => {
  const percent = limit > 0 ? (spent / limit) * 100 : 0;
  const isOver = limit > 0 && spent > limit;
  const isWarn = !isOver && percent >= 75;
  const barColor = isOver ? "bg-red-500" : isWarn ? "bg-yellow-500" : "bg-emerald-500";
  const remaining = Math.max(limit - spent, 0);

  return (
    <div
      className={`bg-[#FFFFFF] border rounded-2xl p-5 transition-all ${
        isOver ? "border-red-500/40 shadow-red-500/10 shadow-lg" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-gray-900 font-semibold text-sm">{category}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isOver && (
            <span className="text-xs bg-red-500/20 text-red-600 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
              Over!
            </span>
          )}
          {isWarn && !isOver && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-medium">
              {percent.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {limit > 0 ? (
        <>
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>₹{spent.toLocaleString("en-IN")} spent</span>
            <span>₹{limit.toLocaleString("en-IN")} limit</span>
          </div>
          <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden mb-3">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-700`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mb-4">
            {isOver
              ? `₹${(spent - limit).toLocaleString("en-IN")} over limit`
              : `₹${remaining.toLocaleString("en-IN")} remaining`}
          </p>
        </>
      ) : (
        <p className="text-gray-600 text-sm mb-4 italic">No limit set</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 text-xs bg-blue-600/15 text-blue-600 border border-blue-600/25 py-2 rounded-xl hover:bg-blue-600/25 transition-colors cursor-pointer"
        >
          {limit > 0 ? "Edit Limit" : "Set Limit"}
        </button>
        {limit > 0 && (
          <button
            onClick={onDelete}
            className="text-xs bg-red-500/15 text-red-600 border border-red-500/25 px-3 py-2 rounded-xl hover:bg-red-500/25 transition-colors cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

const Budgets = () => {
  const { sortedTransactions, loading: txLoading } = useTransactions();
  const { budgets, budgetEmojis, loading: budgetLoading, setBudget, deleteBudget } = useBudgets();
  const [editingCategory, setEditingCategory] = useState(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const thisMonth = moment().format("MMM YY");

  const spendingByCategory = sortedTransactions
    .filter((t) => {
      const m = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"]);
      return t.type === "expense" && m.isValid() && m.format("MMM YY") === thisMonth;
    })
    .reduce((acc, t) => {
      const cat = t.category || "Other";
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {});

  // Custom categories = any budget key not in EXPENSE_CATEGORIES
  const customCategories = Object.keys(budgets).filter(
    (cat) => !EXPENSE_CATEGORIES.includes(cat)
  );

  const allCategories = [...EXPENSE_CATEGORIES, ...customCategories];

  const totalBudgeted = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSpent = allCategories.reduce((s, cat) => s + (spendingByCategory[cat] || 0), 0);
  const budgetsSet = Object.keys(budgets).length;
  const overBudgetCount = allCategories.filter((cat) => {
    const limit = budgets[cat];
    return limit && (spendingByCategory[cat] || 0) > limit;
  }).length;

  if (txLoading || budgetLoading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Monthly spending limits for {moment().format("MMMM YYYY")}
          </p>
        </div>
        <button
          onClick={() => setCustomModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all shadow-lg shadow-blue-600/20 text-sm cursor-pointer"
        >
          + Custom Category
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Total Budgeted</p>
          <p className="text-xl font-bold text-blue-700">₹{totalBudgeted.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Spent This Month</p>
          <p className="text-xl font-bold text-red-600">₹{totalSpent.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Budgets Set</p>
          <p className="text-xl font-bold text-emerald-600">{budgetsSet}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Over Budget</p>
          <p className={`text-xl font-bold ${overBudgetCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {overBudgetCount}
          </p>
        </div>
      </div>

      {/* Standard categories */}
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
        Standard Categories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {EXPENSE_CATEGORIES.map((category) => (
          <BudgetCard
            key={category}
            category={category}
            icon={CATEGORY_ICONS[category] || "📦"}
            limit={budgets[category] || 0}
            spent={spendingByCategory[category] || 0}
            onEdit={() => setEditingCategory(category)}
            onDelete={() => deleteBudget(category)}
          />
        ))}
      </div>

      {/* Custom categories */}
      {customCategories.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Custom Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCategories.map((category) => (
              <BudgetCard
                key={category}
                category={category}
                icon={budgetEmojis[category] || "🏷️"}
                limit={budgets[category] || 0}
                spent={spendingByCategory[category] || 0}
                onEdit={() => setEditingCategory(category)}
                onDelete={() => deleteBudget(category)}
              />
            ))}
          </div>
        </>
      )}

      {/* Edit / Set limit modal */}
      {editingCategory && (
        <BudgetModal
          category={editingCategory}
          current={budgets[editingCategory]}
          onSave={async (val) => {
            await setBudget(editingCategory, val, budgetEmojis[editingCategory] || null);
            setEditingCategory(null);
          }}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {/* Create custom category modal */}
      {customModalOpen && (
        <CustomCategoryModal
          onSave={async ({ name, emoji, limit }) => {
            await setBudget(name, limit, emoji);
            setCustomModalOpen(false);
          }}
          onClose={() => setCustomModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Budgets;
