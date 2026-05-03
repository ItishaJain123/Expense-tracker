import Button from "./Button";

const Cards = ({
  currentBalance,
  income,
  expense,
  showExpenseModal,
  showIncomeModal,
  showResetModal,
  balanceLabel = "Current Balance",
}) => {
  const cards = [
    {
      title: balanceLabel,
      icon: "💼",
      value: currentBalance,
      gradient: "from-blue-600/20 to-sky-400/20",
      border: "border-blue-600/30",
      valueColor: currentBalance >= 0 ? "text-blue-700" : "text-red-600",
      action: { text: "Reset Balance", fn: showResetModal, blue: false },
    },
    {
      title: "Total Income",
      icon: "📈",
      value: income,
      gradient: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-500/30",
      valueColor: "text-emerald-700",
      action: { text: "Add Income", fn: showIncomeModal, blue: true },
    },
    {
      title: "Total Expense",
      icon: "📉",
      value: expense,
      gradient: "from-red-500/20 to-rose-500/20",
      border: "border-red-500/30",
      valueColor: "text-red-700",
      action: { text: "Add Expense", fn: showExpenseModal, blue: false },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {cards.map(({ title, icon, value, gradient, border, valueColor, action }) => (
        <div
          key={title}
          className={`bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-6 shadow-xl backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 text-sm font-medium">{title}</span>
            <span className="text-2xl">{icon}</span>
          </div>
          <p className={`text-3xl font-bold ${valueColor} mb-6`}>
            ₹{value.toLocaleString("en-IN")}
          </p>
          <Button
            text={action.text}
            onClick={action.fn}
            fullWidth
            blue={action.blue}
          />
        </div>
      ))}
    </div>
  );
};

export default Cards;
