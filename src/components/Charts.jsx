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

const generateColors = (length) => {
  const colors = [];
  const step = 360 / length;
  for (let i = 0; i < length; i++) {
    const hue = i * step;
    colors.push(`hsl(${hue}, 100%, 60%)`);
  }
  return colors;
};

const Charts = ({ sortedTransactions }) => {
  const barData = [];

  sortedTransactions.forEach((item) => {
    const existing = barData.find((entry) => entry.date === item.date);
    if (existing) {
      existing.amount += Number(item.amount);
    } else {
      barData.push({
        date: item.date,
        amount: Number(item.amount),
      });
    }
  });

  const spendingData = sortedTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => {
      const existing = acc.find(
        (item) => item.name.toLowerCase() === curr.name.toLowerCase()
      );
      if (existing) {
        existing.amount += Number(curr.amount);
      } else {
        acc.push({ name: curr.name, amount: Number(curr.amount) });
      }
      return acc;
    }, []);

  const dynamicColors = generateColors(spendingData.length);

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-white py-6">
        🔍 Analytics Overview
      </h2>

      <div className="flex flex-col lg:flex-row gap-10 justify-center items-start">
        {/* Bar Chart */}
        <div className="w-full lg:w-1/2 bg-[#1e293b] rounded-lg p-5 shadow-lg border border-gray-600">
          <h3 className="text-xl font-semibold text-pink-300 mb-4">
            📊 Transactions Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  color: "white",
                  border: "1px solid #475569",
                }}
              />
              <Bar dataKey="amount" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="w-full lg:w-1/2 bg-[#1e293b] rounded-lg p-5 shadow-lg border border-gray-600">
          <h3 className="text-xl font-semibold text-pink-300 mb-4">
            🧾 Your Expenses Breakdown
          </h3>

          {spendingData.length === 0 ||
          spendingData.reduce((acc, curr) => acc + curr.amount, 0) === 0 ? (
            <p className="text-center text-white text-lg py-12">
              🚫 No expense data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendingData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {spendingData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={dynamicColors[index]}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: "white" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ccd4e0",
                    color: "white",
                    border: "1px solid #475569",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;
