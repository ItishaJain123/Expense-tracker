import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";

export const useSplitBills = () => {
  const [user] = useAuthState(auth);
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSplits = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, `users/${user.uid}/splitBills`));
      setSplits(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      );
    } catch {
      toast.error("Failed to load split bills");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSplits();
  }, [fetchSplits]);

  const saveSplit = async (data) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/splitBills`), {
        ...data,
        createdAt: new Date(),
      });
      await fetchSplits();
    } catch {
      toast.error("Failed to save split bill");
    }
  };

  const deleteSplit = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/splitBills`, id));
      await fetchSplits();
      toast.success("Split bill removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return { splits, loading, saveSplit, deleteSplit };
};
