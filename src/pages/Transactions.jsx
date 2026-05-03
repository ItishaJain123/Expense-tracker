import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useTransactions } from "../hooks/useTransactions";
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

  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [billSplitOpen, setBillSplitOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState({ start: "", end: "" });

  // Keep filtered list in sync when underlying data refreshes
  useEffect(() => {
    if (activeFilter.start && activeFilter.end) {
      setFilteredTransactions(
        applyDateFilter(activeFilter.start, activeFilter.end, sortedTransactions)
      );
    } else {
      setFilteredTransactions(sortedTransactions);
    }
  }, [sortedTransactions]);

  const handleDateChange = (start, end) => {
    setActiveFilter({ start, end });
    setFilteredTransactions(applyDateFilter(start, end, sortedTransactions));
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
            {transactions.length} total &nbsp;·&nbsp;
            <span className="text-emerald-600">
              ₹{income.toLocaleString("en-IN")} in
            </span>
            &nbsp;·&nbsp;
            <span className="text-red-600">
              ₹{expense.toLocaleString("en-IN")} out
            </span>
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

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wide">
            Balance
          </p>
          <p
            className={`text-xl font-bold ${
              balance >= 0 ? "text-blue-700" : "text-red-600"
            }`}
          >
            ₹{balance.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wide">
            Income
          </p>
          <p className="text-xl font-bold text-emerald-600">
            ₹{income.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wide">
            Expense
          </p>
          <p className="text-xl font-bold text-red-600">
            ₹{expense.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Date filter */}
      <DateRangeFilter handleDateChange={handleDateChange} />

      {/* Table */}
      <TransactionsTable
        transactions={filteredTransactions}
        addTransaction={addTransaction}
        fetchTransactions={fetchTransactions}
        handleDelete={(id, name) => {
          setSelectedTransaction({ id, name });
          setDeleteModalVisible(true);
        }}
        handleEdit={(t) => {
          setSelectedTransaction(t);
          setEditModalVisible(true);
        }}
        handleBulkDelete={async (ids) => {
          if (!window.confirm(`Delete ${ids.length} transactions?`)) return;
          try {
            await Promise.all(ids.map((id) => deleteTransaction(id)));
            await fetchTransactions();
            toast.success(`${ids.length} transactions deleted`);
          } catch { toast.error("Bulk delete failed"); }
        }}
      />

      {/* Bill Split Modal */}
      {billSplitOpen && (
        <BillSplitModal
          onClose={() => setBillSplitOpen(false)}
          onAddTransactions={async (txns) => {
            for (const t of txns) await addTransaction(t, true);
            await fetchTransactions();
          }}
        />
      )}

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
    </div>
  );
};

export default Transactions;
