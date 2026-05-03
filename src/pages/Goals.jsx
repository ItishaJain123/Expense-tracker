import { useState } from "react";
import moment from "moment";
import { useGoals } from "../hooks/useGoals";

const EMOJI_OPTIONS = ["🎯", "💻", "🏠", "✈️", "🚗", "📚", "💍", "🏋️", "🎓", "💰", "🎮", "📱", "🛒", "🌴", "🎸"];

const AddGoalModal = ({ onSave, onClose, existingGoals }) => {
  const defaultDeadline = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [form, setForm] = useState({ name: "", targetAmount: "", deadline: defaultDeadline, emoji: "🎯" });
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Goal name is required";
    if (!form.targetAmount || Number(form.targetAmount) <= 0) newErrors.targetAmount = "Enter a valid target amount";
    const isDuplicate = existingGoals?.some(
      (g) => g.name.trim().toLowerCase() === form.name.trim().toLowerCase()
    );
    if (isDuplicate) newErrors.name = "A goal with this name already exists";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSave({ ...form, targetAmount: Number(form.targetAmount) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-gray-900 font-bold text-xl mb-5">🏆 Create New Goal</h3>

        {/* Emoji picker */}
        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Icon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                  form.emoji === e
                    ? "bg-blue-600/30 border border-blue-600/60"
                    : "bg-[#F1F5F9] border border-gray-200 hover:border-gray-500"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Goal Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((e) => ({ ...e, name: "" })); }}
            placeholder="e.g. Buy a Laptop, Europe Trip, Emergency Fund"
            autoFocus
            className={`w-full bg-[#F1F5F9] border text-gray-900 rounded-xl px-4 py-3 focus:outline-none transition-colors ${errors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-600"}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">⚠ {errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Target Amount (₹) *</label>
          <input
            type="number"
            min={1}
            value={form.targetAmount}
            onChange={(e) => { setForm((f) => ({ ...f, targetAmount: e.target.value })); setErrors((e) => ({ ...e, targetAmount: "" })); }}
            placeholder="e.g. 80000"
            className={`w-full bg-[#F1F5F9] border text-gray-900 rounded-xl px-4 py-3 focus:outline-none transition-colors ${errors.targetAmount ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-600"}`}
          />
          {errors.targetAmount && <p className="text-red-500 text-xs mt-1">⚠ {errors.targetAmount}</p>}
        </div>

        <div className="mb-6">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">
            Target Date <span className="normal-case text-gray-500">(default: 3 months from today)</span>
          </label>
          <input
            type="date"
            value={form.deadline}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
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
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-sky-600 transition-all cursor-pointer"
          >
            Create Goal
          </button>
        </div>
      </div>
    </div>
  );
};

const ContributeModal = ({ goal, onSave, onClose }) => {
  const [amount, setAmount] = useState("");
  const remaining = Number(goal.targetAmount) - Number(goal.savedAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-5">
          <span className="text-5xl">{goal.emoji}</span>
          <h3 className="text-gray-900 font-bold text-lg mt-2">{goal.name}</h3>
          <p className="text-gray-600 text-sm mt-1">
            ₹{remaining.toLocaleString("en-IN")} still needed
          </p>
        </div>

        <div className="mb-5">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Amount to Add (₹)</label>
          <input
            type="number"
            min={1}
            max={remaining}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Max ₹${remaining.toLocaleString("en-IN")}`}
            autoFocus
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
            onClick={() => amount && Number(amount) > 0 && onSave(Number(amount))}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer"
          >
            Add ₹{amount ? Number(amount).toLocaleString("en-IN") : "0"}
          </button>
        </div>
      </div>
    </div>
  );
};

const GoalCard = ({ goal, onContribute, onDelete }) => {
  const saved = Number(goal.savedAmount);
  const target = Number(goal.targetAmount);
  const percent = Math.min((saved / target) * 100, 100);
  const isComplete = saved >= target;
  const daysLeft = goal.deadline
    ? moment(goal.deadline).diff(moment(), "days")
    : null;

  return (
    <div
      className={`bg-[#FFFFFF] border rounded-2xl p-6 flex flex-col gap-4 transition-all ${
        isComplete
          ? "border-emerald-500/40 shadow-emerald-500/10 shadow-lg"
          : "border-gray-200 hover:border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
              isComplete ? "bg-emerald-500/20" : "bg-blue-600/15"
            }`}
          >
            {isComplete ? "✅" : goal.emoji}
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-base">{goal.name}</h3>
            {daysLeft !== null && !isComplete && (
              <p className={`text-xs mt-0.5 ${daysLeft < 0 ? "text-red-600" : daysLeft < 30 ? "text-yellow-400" : "text-gray-600"}`}>
                {daysLeft < 0
                  ? `${Math.abs(daysLeft)}d overdue`
                  : daysLeft === 0
                  ? "Due today"
                  : `${daysLeft}d left`}
              </p>
            )}
            {isComplete && (
              <p className="text-emerald-600 text-xs mt-0.5 font-medium">Completed! 🎉</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-gray-600 hover:text-red-600 transition-colors text-lg cursor-pointer"
        >
          ×
        </button>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>₹{saved.toLocaleString("en-IN")} saved</span>
          <span>₹{target.toLocaleString("en-IN")} target</span>
        </div>
        <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isComplete
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-gradient-to-r from-blue-600 to-sky-400"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5 text-right">{percent.toFixed(1)}% complete</p>
      </div>

      {!isComplete && (
        <button
          onClick={() => onContribute(goal)}
          className="w-full py-2.5 rounded-xl bg-blue-600/15 text-blue-600 border border-blue-600/25 hover:bg-blue-600/25 transition-colors text-sm font-medium cursor-pointer"
        >
          + Add Savings
        </button>
      )}
    </div>
  );
};

const Goals = () => {
  const { goals, loading, addGoal, deleteGoal, addContribution } = useGoals();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);

  const activeGoals = goals.filter((g) => Number(g.savedAmount) < Number(g.targetAmount));
  const completedGoals = goals.filter((g) => Number(g.savedAmount) >= Number(g.targetAmount));
  const totalSaved = goals.reduce((s, g) => s + Number(g.savedAmount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-1 text-sm">
            {goals.length} goal{goals.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
            {completedGoals.length} completed
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all shadow-lg shadow-blue-600/20 text-sm cursor-pointer"
        >
          + New Goal
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Total Saved</p>
            <p className="text-xl font-bold text-emerald-600">
              ₹{totalSaved.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Total Target</p>
            <p className="text-xl font-bold text-blue-700">
              ₹{totalTarget.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Overall Progress</p>
            <p className="text-xl font-bold text-sky-600">
              {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-7xl">🏆</span>
          <h2 className="text-xl font-bold text-gray-900">No goals yet</h2>
          <p className="text-gray-600 text-sm text-center max-w-xs">
            Create a savings goal — a new laptop, vacation, or emergency fund.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg text-sm cursor-pointer"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">In Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={setContributeGoal}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        </>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-600 mb-4">Completed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={setContributeGoal}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        </>
      )}

      {addModalOpen && (
        <AddGoalModal
          onSave={async (goal) => { await addGoal(goal); setAddModalOpen(false); }}
          onClose={() => setAddModalOpen(false)}
          existingGoals={goals}
        />
      )}

      {contributeGoal && (
        <ContributeModal
          goal={contributeGoal}
          onSave={async (amt) => { await addContribution(contributeGoal.id, amt); setContributeGoal(null); }}
          onClose={() => setContributeGoal(null)}
        />
      )}
    </div>
  );
};

export default Goals;
