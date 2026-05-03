import { useState } from "react";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSplitBills } from "../hooks/useSplitBills";

const ACCOUNT_ICONS = {
  Bank: "🏦", Wallet: "👛", Cash: "💵", "Credit Card": "💳",
  Savings: "🏧", Investment: "📈", Other: "💼",
};

const BillSplitModal = ({ onClose, onAddTransactions, accounts = [] }) => {
  const [user] = useAuthState(auth);
  const { saveSplit } = useSplitBills();

  const defaultMyName =
    user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Me";

  const [billName, setBillName] = useState("");
  const [bill, setBill] = useState("");
  const [tip, setTip] = useState(0);
  const [myName, setMyName] = useState(defaultMyName);
  const [others, setOthers] = useState([{ name: "" }]);
  const [accountId, setAccountId] = useState("");

  const subtotal = Number(bill) || 0;
  const total = subtotal * (1 + tip / 100);
  const allPeople = [{ name: myName || "Me", isMe: true }, ...others];
  const perPerson = allPeople.length > 0 ? total / allPeople.length : 0;

  const addOther = () => {
    if (others.some((p) => !p.name.trim())) {
      toast.error("Fill in the existing person's name first");
      return;
    }
    setOthers([...others, { name: "" }]);
  };
  const removeOther = (i) => others.length > 1 && setOthers(others.filter((_, idx) => idx !== i));
  const updateOther = (i, name) => setOthers(others.map((p, idx) => (idx === i ? { name } : p)));

  const handleAdd = async () => {
    if (!bill || subtotal <= 0) { toast.error("Enter a valid bill amount"); return; }
    if (!myName.trim()) { toast.error("Enter your name"); return; }

    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const peopleList = allPeople.map((p) => ({ name: p.name || "Person", isMe: !!p.isMe }));

    await saveSplit({
      billName: billName.trim() || "Shared Bill",
      totalAmount: total,
      tip,
      people: peopleList,
      perPerson,
      myShare: perPerson,
      date: today,
    });

    await onAddTransactions([{
      name: `Split: ${billName.trim() || "Shared Bill"}`,
      amount: perPerson,
      type: "expense",
      category: "Other",
      date: today,
      ...(accountId ? { accountId } : {}),
    }]);

    toast.success("Bill split saved & your share added!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">🧾 Split Bill</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer leading-none">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Bill name */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Bill Name (optional)</label>
            <input
              type="text"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              placeholder="e.g. Dinner at Barbeque Nation"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-blue-500 bg-gray-50 text-sm"
            />
          </div>

          {/* Bill amount */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Total Bill Amount (₹) *</label>
            <input
              type="number"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              placeholder="e.g. 2400"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 bg-gray-50 text-lg font-semibold"
            />
          </div>

          {/* Tip */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Tip</label>
            <div className="flex gap-2">
              {[0, 5, 10, 15, 20].map((t) => (
                <button
                  key={t}
                  onClick={() => setTip(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    tip === t ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          {/* My name */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Your Name *</label>
            <input
              type="text"
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-blue-200 bg-blue-50 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-blue-500 text-sm font-medium"
            />
            <p className="text-xs text-blue-500 mt-1">Only your share will be added as a transaction</p>
          </div>

          {/* Others */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 uppercase tracking-wide">Other People</label>
              <button onClick={addOther} className="text-blue-600 text-xs font-semibold hover:text-blue-700 cursor-pointer">+ Add Person</button>
            </div>
            <div className="space-y-2">
              {others.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updateOther(i, e.target.value)}
                    placeholder={`Person ${i + 2}`}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 bg-gray-50"
                  />
                  {others.length > 1 && (
                    <button onClick={() => removeOther(i)} className="text-red-400 hover:text-red-600 cursor-pointer text-lg leading-none">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account selector */}
          {accounts.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">
                Deduct from Account <span className="normal-case text-gray-400">(optional)</span>
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-blue-500 bg-gray-50 text-sm"
              >
                <option value="">No account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {ACCOUNT_ICONS[a.type] || "💼"} {a.name} — ₹{Number(a.balance).toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Result */}
          {subtotal > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Each person pays</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ₹{perPerson.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500 space-y-0.5">
                  <p>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>
                  {tip > 0 && <p>Tip: ₹{(total - subtotal).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>}
                  <p className="font-semibold text-gray-700">Total: ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 border-t border-blue-100 pt-2">
                {allPeople.length} people: {allPeople.map(p => p.name || "…").join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0 sticky bottom-0 bg-white border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm cursor-pointer hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold text-sm cursor-pointer hover:from-blue-700 hover:to-sky-600"
          >
            Save & Add My Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillSplitModal;
