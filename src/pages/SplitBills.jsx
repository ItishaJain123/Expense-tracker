import { useState } from "react";
import moment from "moment";
import { useSplitBills } from "../hooks/useSplitBills";
import { useTransactions } from "../hooks/useTransactions";
import { useAccounts } from "../hooks/useAccounts";
import BillSplitModal from "../components/BillSplitModal";

const SplitBills = () => {
  const { splits, loading, deleteSplit } = useSplitBills();
  const { addTransaction, fetchTransactions } = useTransactions();
  const { accounts, fetchAccounts } = useAccounts();
  const [modalOpen, setModalOpen] = useState(false);

  const totalSplits = splits.length;
  const totalAmount = splits.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalMyShare = splits.reduce((s, b) => s + (b.myShare || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Split Bills</h1>
          <p className="text-gray-600 mt-1 text-sm">Track bills split with others</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all shadow-lg shadow-blue-600/20 text-sm cursor-pointer"
        >
          + New Split
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Total Bills Split</p>
          <p className="text-2xl font-bold text-blue-600">{totalSplits}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">Total Bill Amount</p>
          <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-1.5">My Total Share</p>
          <p className="text-2xl font-bold text-red-600">₹{totalMyShare.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Empty state */}
      {splits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-7xl">🧾</span>
          <h2 className="text-xl font-bold text-gray-900">No split bills yet</h2>
          <p className="text-gray-600 text-sm text-center max-w-xs">
            Split a restaurant bill, trip expenses, or any shared cost with friends.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer shadow-lg"
          >
            Split Your First Bill
          </button>
        </div>
      )}

      {/* Bills list */}
      {splits.length > 0 && (
        <div className="space-y-4">
          {splits.map((bill) => (
            <div key={bill.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 font-bold text-base">{bill.billName || "Bill"}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {bill.date} · {bill.people?.length || 0} people
                    {bill.tip > 0 && ` · ${bill.tip}% tip`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-gray-900 font-bold">₹{(bill.totalAmount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                  </div>
                  <button
                    onClick={() => deleteSplit(bill.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* People grid */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(bill.people || []).map((p, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                      p.isMe
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    {p.isMe && <span>👤</span>}
                    <span>{p.name}</span>
                    <span className="text-gray-400">·</span>
                    <span>₹{(bill.perPerson || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>

              {/* My share highlight */}
              <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <span className="text-red-700 text-sm font-medium">👤 Your share</span>
                <span className="text-red-700 font-bold">-₹{(bill.myShare || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <BillSplitModal
          onClose={() => setModalOpen(false)}
          accounts={accounts}
          onAddTransactions={async (txns) => {
            for (const t of txns) await addTransaction(t, true);
            await fetchTransactions();
            await fetchAccounts();
          }}
        />
      )}
    </div>
  );
};

export default SplitBills;
