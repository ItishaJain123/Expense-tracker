import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";

export const useBudgets = () => {
  const [user] = useAuthState(auth);
  const [budgets, setBudgets] = useState({});      // { category: limit }  — backward compatible
  const [budgetEmojis, setBudgetEmojis] = useState({}); // { category: emoji } — custom categories
  const [loading, setLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, `users/${user.uid}/budgets`));
      const limits = {};
      const emojis = {};
      snap.docs.forEach((d) => {
        limits[d.id] = d.data().limit;
        if (d.data().emoji) emojis[d.id] = d.data().emoji;
      });
      setBudgets(limits);
      setBudgetEmojis(emojis);
    } catch {
      toast.error("Failed to load budgets");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const setBudget = async (category, limit, emoji = null) => {
    if (!user) return;
    try {
      const data = { limit: Number(limit) };
      if (emoji) data.emoji = emoji;
      await setDoc(doc(db, `users/${user.uid}/budgets`, category), data);
      await fetchBudgets();
      toast.success("Budget saved!");
    } catch {
      toast.error("Failed to save budget");
    }
  };

  const deleteBudget = async (category) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/budgets`, category));
      await fetchBudgets();
      toast.success("Budget removed");
    } catch {
      toast.error("Failed to remove budget");
    }
  };

  return { budgets, budgetEmojis, loading, fetchBudgets, setBudget, deleteBudget };
};
