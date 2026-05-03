import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";

export const useGoals = () => {
  const [user] = useAuthState(auth);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, `users/${user.uid}/goals`));
      setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to load goals");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (goal) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/goals`), {
        ...goal,
        savedAmount: 0,
        createdAt: new Date(),
      });
      await fetchGoals();
      toast.success("Goal created!");
    } catch {
      toast.error("Failed to create goal");
    }
  };

  const deleteGoal = async (id) => {
    try {
      await deleteDoc(doc(db, `users/${user.uid}/goals`, id));
      await fetchGoals();
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  const addContribution = async (id, amount) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const newSaved = Math.min(
      Number(goal.savedAmount) + Number(amount),
      Number(goal.targetAmount)
    );
    try {
      await updateDoc(doc(db, `users/${user.uid}/goals`, id), {
        savedAmount: newSaved,
      });
      await fetchGoals();
      if (newSaved >= Number(goal.targetAmount)) {
        toast.success("🎉 Goal completed!");
      } else {
        toast.success("Contribution added!");
      }
    } catch {
      toast.error("Failed to add contribution");
    }
  };

  return { goals, loading, fetchGoals, addGoal, deleteGoal, addContribution };
};
