import { useState } from "react";
import { useAccounts } from "../hooks/useAccounts";
import { useTransactions } from "../hooks/useTransactions";
import moment from "moment";

const ACCOUNT_TYPES = ["Bank", "Wallet", "Cash", "Credit Card", "Savings", "Investment", "Other"];
const ACCOUNT_ICONS = {
  Bank: "🏦",
  Wallet: "👛",
  Cash: "💵",
  "Credit Card": "💳",
  Savings: "🏧",
  Investment: "📈",
  Other: "💼",
};
const ACCOUNT_COLORS = {
  Bank: "from-blue-500 to-cyan-500",
  Wallet: "from-sky-400 to-pink-500",
  Cash: "from-emerald-500 to-teal-500",
  "Credit Card": "from-orange-500 to-red-500",
  Savings: "from-blue-600 to-blue-500",
  Investment: "from-green-500 to-emerald-500",
  Other: "from-gray-500 to-gray-600",
};

const AccountModal = ({ account, onSave, onClose }) => {
  const [form, setForm] = useState(
    account || { name: "", type: "Bank", balance: "" }
  );

  const handleSave = () => {
    if (!form.name || form.balance === "") return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-gray-900 font-bold text-xl mb-5">
          {account ? "Edit Account" : "Add Account"}
        </h3>

        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Account Type</label>
          <div className="grid grid-cols-4 gap-2">
            {ACCOUNT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                  form.type === t
                    ? "bg-blue-600/25 border border-blue-600/60 text-blue-700"
                    : "bg-[#F1F5F9] border border-gray-200 text-gray-600 hover:border-gray-500"
                }`}
              >
                <span className="text-xl">{ACCOUNT_ICONS[t]}</span>
                <span>{t}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Account Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. HDFC Savings"
            className="w-full bg-[#F1F5F9] border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">
            Opening Balance (₹) <span className="normal-case text-gray-400">— auto-updated by transactions</span>
          </label>
          <input
            type="number"
            value={form.balance}
            onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
            placeholder="e.g. 25000"
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
            {account ? "Save Changes" : "Add Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

const TransferModal = ({ accounts, onTransfer, onClose }) => {
  const [fromId, setFromId] = useState(accounts[0]?.id || "");
  const [toId, setToId] = useState(accounts[1]?.id || "");
  const [amount, setAmount] = useState("");

  const fromAccount = accounts.find((a) => a.id === fromId);
  const toAccount = accounts.find((a) => a.id === toId);

  const handleTransfer = () => {
    if (!fromId || !toId || fromId === toId || !amount || Number(amount) <= 0) return;
    onTransfer(fromId, toId, Number(amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-gray-900 font-bold text-xl mb-5">Transfer Funds</h3>

        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">From Account</label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="w-full bg-[#F1F5F9] border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {ACCOUNT_ICONS[a.type] || "💼"} {a.name} — ₹{Number(a.balance).toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">To Account</label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="w-full bg-[#F1F5F9] border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id} disabled={a.id === fromId}>
                {ACCOUNT_ICONS[a.type] || "💼"} {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">Amount (₹)</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000"
            autoFocus
            className="w-full bg-[#F1F5F9] border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
        {fromAccount && (
          <p className="text-gray-500 text-xs mb-5 px-1">
            Available: ₹{Number(fromAccount.balance).toLocaleString("en-IN")}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!fromId || !toId || fromId === toId || !amount}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountCard = ({ account, onEdit, onDelete, onView }) => {
  const icon = ACCOUNT_ICONS[account.type] || "💼";
  const gradient = ACCOUNT_COLORS[account.type] || "from-gray-500 to-gray-600";
  const balance = Number(account.balance);
  const isNegative = balance < 0;

  return (
    <div
      className="bg-[#FFFFFF] border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-2xl p-5 transition-all flex flex-col gap-4 cursor-pointer"
      onClick={() => onView(account)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
            {icon}
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-base">{account.name}</h3>
            <span className="text-xs text-gray-500 bg-[#F1F5F9] px-2 py-0.5 rounded-full">{account.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(account)}
            className="text-gray-500 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-600/10 cursor-pointer text-sm"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="text-gray-500 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer text-lg leading-none"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>

      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Current Balance</p>
        <p className={`text-2xl font-bold ${isNegative ? "text-red-600" : "text-gray-900"}`}>
          {isNegative ? "-" : ""}₹{Math.abs(balance).toLocaleString("en-IN")}
        </p>
      </div>

      <p className="text-xs text-blue-600 font-medium">Tap to view transactions →</p>
    </div>
  );
};

const AccountTransactionsPanel = ({ account, transactions, onClose }) => {
  const icon = ACCOUNT_ICONS[account.type] || "💼";
  const gradient = ACCOUNT_COLORS[account.type] || "from-gray-500 to-gray-600";
  const linked = transactions
    .filter((t) => t.accountId === account.id)
    .sort((a, b) =>
      moment(b.date, ["D MMMM YYYY", "YYYY-MM-DD"]).valueOf() -
      moment(a.date, ["D MMMM YYYY", "YYYY-MM-DD"]).valueOf()
    );

  const totalIn = linked.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = linked.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow`}>
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{account.name}</h2>
              <p className="text-xs text-gray-500">{linked.length} transaction{linked.length !== 1 ? "s" : ""} linked</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>

        {/* Balance strip */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Balance</p>
            <p className={`text-lg font-bold ${Number(account.balance) < 0 ? "text-red-600" : "text-gray-900"}`}>
              ₹{Number(account.balance).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Money In</p>
            <p className="text-lg font-bold text-emerald-600">+₹{totalIn.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Money Out</p>
            <p className="text-lg font-bold text-red-600">-₹{totalOut.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-y-auto p-4">
          {linked.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="text-5xl">📭</span>
              <p className="text-gray-600 text-sm">No transactions linked to this account yet.</p>
              <p className="text-gray-400 text-xs">Select this account when adding income or expenses.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {linked.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                      t.type === "income" ? "bg-emerald-100" : "bg-red-100"
                    }`}>
                      {t.type === "income" ? "💰" : "💸"}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{t.name}</p>
                      <p className="text-gray-400 text-xs">{t.date} · {t.category}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold flex-shrink-0 ${
                    t.type === "income" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {t.type === "income" ? "+" : "-"}₹{Number(t.amount).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Accounts = () => {
  const { accounts, loading, addAccount, updateAccount, deleteAccount, transfer, totalBalance } = useAccounts();
  const { transactions } = useTransactions();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState(null);

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
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1 text-sm">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
            Net worth: <span className={totalBalance >= 0 ? "text-emerald-600" : "text-red-600"}>
              ₹{totalBalance.toLocaleString("en-IN")}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {accounts.length >= 2 && (
            <button
              onClick={() => setTransferOpen(true)}
              className="bg-[#F1F5F9] border border-gray-200 text-gray-300 hover:text-gray-900 hover:border-gray-500 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
            >
              ⇄ Transfer
            </button>
          )}
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all shadow-lg shadow-blue-600/20 text-sm cursor-pointer"
          >
            + Add Account
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Total Balance</p>
            <p className={`text-xl font-bold ${totalBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              ₹{totalBalance.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Accounts</p>
            <p className="text-xl font-bold text-blue-700">{accounts.length}</p>
          </div>
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Highest Balance</p>
            <p className="text-xl font-bold text-sky-600">
              ₹{Math.max(...accounts.map((a) => Number(a.balance))).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Account Types</p>
            <p className="text-xl font-bold text-cyan-400">
              {new Set(accounts.map((a) => a.type)).size}
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {accounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-7xl">🏦</span>
          <h2 className="text-xl font-bold text-gray-900">No accounts yet</h2>
          <p className="text-gray-600 text-sm text-center max-w-xs">
            Add your bank accounts, wallets, and cash to track your total net worth in one place.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg text-sm cursor-pointer"
          >
            Add Your First Account
          </button>
        </div>
      )}

      {/* Account grid */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={setEditAccount}
              onDelete={deleteAccount}
              onView={setViewAccount}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      {addModalOpen && (
        <AccountModal
          onSave={async (data) => {
            await addAccount(data);
            setAddModalOpen(false);
          }}
          onClose={() => setAddModalOpen(false)}
        />
      )}

      {/* Edit modal */}
      {editAccount && (
        <AccountModal
          account={editAccount}
          onSave={async (data) => {
            await updateAccount(editAccount.id, {
              name: data.name,
              type: data.type,
              balance: Number(data.balance),
            });
            setEditAccount(null);
          }}
          onClose={() => setEditAccount(null)}
        />
      )}

      {/* Transfer modal */}
      {transferOpen && (
        <TransferModal
          accounts={accounts}
          onTransfer={async (fromId, toId, amount) => {
            await transfer(fromId, toId, amount);
            setTransferOpen(false);
          }}
          onClose={() => setTransferOpen(false)}
        />
      )}

      {/* Account transactions panel */}
      {viewAccount && (
        <AccountTransactionsPanel
          account={viewAccount}
          transactions={transactions}
          onClose={() => setViewAccount(null)}
        />
      )}
    </div>
  );
};

export default Accounts;
