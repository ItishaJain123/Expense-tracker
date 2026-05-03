import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import moment from "moment";

export const useTransactions = () => {
  const [user] = useAuthState(auth);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const snap = await getDocs(q);
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to fetch transactions");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction, many = false) => {
    try {
      await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transaction
      );
      if (!many) toast.success("Transaction Added!");
    } catch {
      if (!many) toast.error("Couldn't add transaction");
    }
  };

  const deleteTransaction = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
    toast.success("Transaction deleted");
  };

  const updateTransaction = async (id, data) => {
    await updateDoc(doc(db, `users/${user.uid}/transactions`, id), data);
    toast.success("Transaction updated!");
  };

  const resetAllTransactions = async () => {
    const q = query(collection(db, `users/${user.uid}/transactions`));
    const snap = await getDocs(q);
    await Promise.all(
      snap.docs.map((d) =>
        deleteDoc(doc(db, `users/${user.uid}/transactions`, d.id))
      )
    );
  };

  const income = transactions.reduce(
    (s, t) => (t.type === "income" ? s + Number(t.amount) : s),
    0
  );
  const expense = transactions.reduce(
    (s, t) => (t.type === "expense" ? s + Number(t.amount) : s),
    0
  );
  const balance = income - expense;

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) =>
          moment(b.date, ["D MMMM YYYY", "YYYY-MM-DD"]).valueOf() -
          moment(a.date, ["D MMMM YYYY", "YYYY-MM-DD"]).valueOf()
      ),
    [transactions]
  );

  return {
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
  };
};
