import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useTransactions } from "../hooks/useTransactions";
import { useAccounts } from "../hooks/useAccounts";
import TransactionsTable from "../components/TransactionsTable";
import DateRangeFilter from "../components/DateRangeFilter";
import AddExpense from "../components/Modals/AddExpense";
import AddIncome from "../components/Modals/AddIncome";
import EditModal from "../components/Modals/EditModal";
import DeleteConfirmationModal from "../components/Modals/DeleteConfirmationModal";
import BillSplitModal from "../components/BillSplitModal";
import Button from "../components/Button";

const applyDateFilter = (start, end, source) => {
  if (!start || !end) return source;
  return source.filter((t) => {
    const txDate = moment(t.date, ["D MMMM YYYY", "YYYY-MM-DD"], true);
    return (
      txDate.isValid() &&
      txDate.isSameOrAfter(moment(start, "YYYY-MM-DD")) &&
      txDate.isSameOrBefore(moment(end, "YYYY-MM-DD"))
    );
  });
};

const Transactions = () => {
  const {
    transactions,
    sortedTransactions,
    loading,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    income,
    expense,
    balance,
  } = useTransactions();

  const { accounts, fetchAccounts, totalBalance } = useAccounts();

  const ACCOUNT_ICONS = { Bank: "🏦", Wallet: "👛", Cash: "💵", "Credit Card": "💳", Savings: "🏧", Investment: "📈", Other: "💼" };

  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [billSplitOpen, setBillSplitOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState({ start: "", end: "" });
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const accountSorted = selectedAccountId
    ? sortedTransactions.filter((t) => t.accountId === selectedAccountId)
    : sortedTransactions;

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const displayIncome = accountSorted.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const displayExpense = accountSorted.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const displayBalance = selectedAccountId
    ? Number(selectedAccount?.balance ?? 0)
    : accounts.length > 0 ? totalBalance : balance;

  useEffect(() => {
    const base = selectedAccountId
      ? sortedTransactions.filter((t) => t.accountId === selectedAccountId)
      : sortedTransactions;
    if (activeFilter.start && activeFilter.end) {
      setFilteredTransactions(applyDateFilter(activeFilter.start, activeFilter.end, base));
    } else {
      setFilteredTransactions(base);
    }
  }, [sortedTransactions, selectedAccountId]);

  const handleDateChange = (start, end) => {
    setActiveFilter({ start, end });
    const base = selectedAccountId
      ? sortedTransactions.filter((t) => t.accountId === selectedAccountId)
      : sortedTransactions;
    setFilteredTransactions(applyDateFilter(start, end, base));
  };

  const onFinish = async (values, type) => {
    const newTransaction = {
      name: values.name,
      amount: Number(values.amount),
      date: values.date ? values.date.format("D MMMM YYYY") : null,
      type,
      category: values.category || "Other",
      ...(values.accountId ? { accountId: values.accountId } : {}),
    };
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    await addTransaction(newTransaction);
    await fetchTransactions();
    if (values.accountId) await fetchAccounts();
  };

  const confirmDelete = async () => {
    if (!selectedTransaction?.id) return;
    try {
      await deleteTransaction(selectedTransaction.id, selectedTransaction);
      await fetchTransactions();
      if (selectedTransaction?.accountId) await fetchAccounts();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      const updated = { ...values, date: values.date.format("D MMMM YYYY") };
      await updateTransaction(selectedTransaction.id, updated, selectedTransaction);
      await fetchTransactions();
      if (selectedTransaction?.accountId || updated.accountId) await fetchAccounts();
      setEditModalVisible(false);
      setSelectedTransaction(null);
    } catch {
      toast.error("Failed to update");
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1 text-sm">
            {accountSorted.length} transaction{accountSorted.length !== 1 ? "s" : ""}
            {selectedAccount ? ` · ${selectedAccount.name}` : ""} &nbsp;·&nbsp;
            <span className="text-emerald-600">₹{displayIncome.toLocaleString("en-IN")} in</span>
            &nbsp;·&nbsp;
            <span className="text-red-600">₹{displayExpense.toLocaleString("en-IN")} out</span>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button text="+ Income" onClick={() => setIsIncomeModalVisible(true)} blue />
          <Button text="+ Expense" onClick={() => setIsExpenseModalVisible(true)} />
          <button
            onClick={() => setBillSplitOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
          >
            🧾 Split Bill
          </button>
        </div>
      </div>

      {/* Account selector */}
      {accounts.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 flex-nowrap">
          <button
            onClick={() => setSelectedAccountId(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              !selectedAccountId
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
            }`}
          >
            All Accounts
          </button>
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAccountId(a.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                selectedAccountId === a.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
              }`}
            >
              <span>{ACCOUNT_ICONS[a.type] || "💼"}</span>
              <span>{a.name}</span>
              <span className={`text-xs font-normal ${selectedAccountId === a.id ? "text-blue-100" : "text-gray-400"}`}>
                ₹{Number(a.balance).toLocaleString("en-IN")}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wide">
            {selectedAccount ? `${selectedAccount.name} Balance` : "Balance"}
          </p>
          <p className={`text-xl font-bold ${displayBalance >= 0 ? "text-blue-700" : "text-red-600"}`}>
            ₹{displayBalance.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wide">Income</p>
          <p className="text-xl font-bold text-emerald-600">₹{displayIncome.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wide">Expense</p>
          <p className="text-xl font-bold text-red-600">₹{displayExpense.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Date filter */}
      <DateRangeFilter handleDateChange={handleDateChange} />

      {/* Table */}
      <TransactionsTable
        transactions={filteredTransactions}
        addTransaction={addTransaction}
        fetchTransactions={fetchTransactions}
        handleDelete={(t) => {
          setSelectedTransaction(t);
          setDeleteModalVisible(true);
        }}
        handleEdit={(t) => {
          setSelectedTransaction(t);
          setEditModalVisible(true);
        }}
        handleBulkDelete={async (ids) => {
          if (!window.confirm(`Delete ${ids.length} transactions?`)) return;
          try {
            const txnsToDelete = transactions.filter((t) => ids.includes(t.id));
            await Promise.all(txnsToDelete.map((t) => deleteTransaction(t.id, t)));
            await fetchTransactions();
            await fetchAccounts();
            toast.success(`${ids.length} transactions deleted`);
          } catch { toast.error("Bulk delete failed"); }
        }}
      />

      {/* Bill Split Modal */}
      {billSplitOpen && (
        <BillSplitModal
          onClose={() => setBillSplitOpen(false)}
          accounts={accounts}
          onAddTransactions={async (txns) => {
            for (const t of txns) await addTransaction(t, true);
            await fetchTransactions();
            await fetchAccounts();
          }}
        />
      )}

      {/* Modals */}
      <AddIncome
        isIncomeModalVisible={isIncomeModalVisible}
        handleIncomeCancel={() => setIsIncomeModalVisible(false)}
        onFinish={onFinish}
        accounts={accounts}
      />
      <AddExpense
        isExpenseModalVisible={isExpenseModalVisible}
        handleExpenseCancel={() => setIsExpenseModalVisible(false)}
        onFinish={onFinish}
        accounts={accounts}
      />
      <EditModal
        editModalVisible={editModalVisible}
        handleEditCancel={() => setEditModalVisible(false)}
        transaction={selectedTransaction}
        handleUpdate={handleUpdate}
        accounts={accounts}
      />
      <DeleteConfirmationModal
        deleteModalVisible={deleteModalVisible}
        handleCancel={() => setDeleteModalVisible(false)}
        handleConfirm={confirmDelete}
        selectedTransaction={selectedTransaction}
      />
    </div>
  );
};

export default Transactions;
