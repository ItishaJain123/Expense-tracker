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

export const useAccounts = () => {
  const [user] = useAuthState(auth);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, `users/${user.uid}/accounts`));
      setAccounts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to load accounts");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = async (account) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/accounts`), {
        ...account,
        balance: Number(account.balance),
        createdAt: new Date(),
      });
      await fetchAccounts();
      toast.success("Account added!");
    } catch {
      toast.error("Failed to add account");
    }
  };

  const updateAccount = async (id, data) => {
    try {
      await updateDoc(doc(db, `users/${user.uid}/accounts`, id), data);
      await fetchAccounts();
      toast.success("Account updated!");
    } catch {
      toast.error("Failed to update account");
    }
  };

  const deleteAccount = async (id) => {
    try {
      await deleteDoc(doc(db, `users/${user.uid}/accounts`, id));
      await fetchAccounts();
      toast.success("Account deleted");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const transfer = async (fromId, toId, amount) => {
    const from = accounts.find((a) => a.id === fromId);
    const to = accounts.find((a) => a.id === toId);
    if (!from || !to) return;
    const amt = Number(amount);
    if (Number(from.balance) < amt) {
      toast.error("Insufficient balance in source account");
      return;
    }
    try {
      await updateDoc(doc(db, `users/${user.uid}/accounts`, fromId), {
        balance: Number(from.balance) - amt,
      });
      await updateDoc(doc(db, `users/${user.uid}/accounts`, toId), {
        balance: Number(to.balance) + amt,
      });
      await fetchAccounts();
      toast.success(`Transferred ₹${amt.toLocaleString("en-IN")} successfully!`);
    } catch {
      toast.error("Transfer failed");
    }
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  return {
    accounts,
    loading,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    transfer,
    totalBalance,
  };
};
