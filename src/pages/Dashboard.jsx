import { useEffect, useState } from "react";
import Header from "../components/Header";
import Cards from "../components/Cards";
import AddExpense from "../components/Modals/AddExpense";
import AddIncome from "../components/Modals/AddIncome";
import {
  addDoc,
  collection,
  getDocs,
  query,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import moment from "moment";
import TransactionsTable from "../components/TransactionsTable";
import NoTransaction from "../components/NoTransaction";
import Charts from "../components/Charts";
import DeleteConfirmationModal from "../components/Modals/DeleteConfirmationModal";
import EditModal from "../components/Modals/EditModal";
import ResetConfirmationModal from "../components/Modals/ResetConfirmationModal";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpenses] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    if (user) {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);
      let transactionsArray = [];
      querySnapshot.forEach((doc) => {
        transactionsArray.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(transactionsArray);
      toast.success("Transactions Fetched!");
    }
    setLoading(false);
  };

  useEffect(() => {
    calculateBalance();
  }, [transactions]);

  const calculateBalance = () => {
    let incomeTotal = 0;
    let expensesTotal = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === "income") {
        incomeTotal += amount;
      } else if (transaction.type === "expense") {
        expensesTotal += amount;
      }
    });

    setIncome(incomeTotal);
    setExpenses(expensesTotal);
    setCurrentBalance(incomeTotal - expensesTotal);
  };

  const showExpenseModal = () => {
    setIsExpenseModalVisible(true);
  };

  const showIncomeModal = () => {
    setIsIncomeModalVisible(true);
  };

  const showResetModal = () => {
    setResetModalVisible(true);
  };

  const handleExpenseCancel = () => {
    setIsExpenseModalVisible(false);
  };

  const handleIncomeCancel = () => {
    setIsIncomeModalVisible(false);
  };

  const handleDelete = (transactionId, name) => {
    setSelectedTransaction({ id: transactionId, name: name });
    setDeleteModalVisible(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
  };

  const confirmDelete = async () => {
    if (!selectedTransaction || !selectedTransaction.id) {
      toast.error("No transaction selected for deletion.");
      return;
    }

    try {
      await deleteDoc(
        doc(db, `users/${user.uid}/transactions`, selectedTransaction.id)
      );
      toast.success("Transaction deleted");
      fetchTransactions();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete transaction");
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      const updatedData = {
        ...values,
        date: values.date.format("D MMMM YYYY"),
      };

      await updateDoc(
        doc(db, `users/${user.uid}/transactions`, selectedTransaction.id),
        updatedData
      );

      toast.success("Transaction updated successfully");
      fetchTransactions();
      setEditModalVisible(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update transaction");
    }
  };

  const handleResetConfirm = async () => {
    try {
      setCurrentBalance(0);
      setIncome(0);
      setExpenses(0);

      // Clear all transactions from Firestore
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);

      const deletionPromises = querySnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, `users/${user.uid}/transactions`, docSnap.id))
      );

      await Promise.all(deletionPromises);

      setTransactions([]);
      toast.success("Balance and all transactions reset!");
      setResetModalVisible(false);
    } catch (error) {
      console.error("Reset failed:", error);
      toast.error("Failed to reset data");
    }
  };

  const onFinish = async (values, type) => {
    const formattedDate = values.date
      ? values.date.format("D MMMM YYYY")
      : null;

    const newTransaction = {
      name: values.name,
      amount: Number(values.amount),
      date: formattedDate,
      type: type,
    };

    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);

    await addTransaction(newTransaction);
    await fetchTransactions();
  };

  const addTransaction = async (transaction, many) => {
    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transaction
      );
      if (!many) {
        toast.success("Transaction Added!");
      }
    } catch (e) {
      if (!many) {
        toast.error("Couldn't add transaction");
      }
    }
  };

  const sortedTransactions = transactions.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <>
      <Header />
      <div className="bg-[#1f2c4b] p-6 shadow-xl">
        <Cards
          currentBalance={currentBalance}
          income={income}
          expense={expense}
          showExpenseModal={showExpenseModal}
          showIncomeModal={showIncomeModal}
          showResetModal={showResetModal}
        />
        {transactions.length === 0 ? (
          <NoTransaction />
        ) : (
          <Charts sortedTransactions={sortedTransactions} />
        )}
        <AddIncome
          isIncomeModalVisible={isIncomeModalVisible}
          handleIncomeCancel={handleIncomeCancel}
          onFinish={onFinish}
        />
        <AddExpense
          isExpenseModalVisible={isExpenseModalVisible}
          handleExpenseCancel={handleExpenseCancel}
          onFinish={onFinish}
        />
        <EditModal
          editModalVisible={editModalVisible}
          handleEditCancel={handleEditCancel}
          transaction={selectedTransaction}
          handleUpdate={handleUpdate}
        />
        <DeleteConfirmationModal
          deleteModalVisible={deleteModalVisible}
          handleCancel={() => setDeleteModalVisible(false)}
          handleConfirm={confirmDelete}
          selectedTransaction={selectedTransaction}
        />
        <ResetConfirmationModal
          resetModalVisible={resetModalVisible}
          handleCancel={() => setResetModalVisible(false)}
          handleConfirm={handleResetConfirm}
        />
        <TransactionsTable
          transactions={transactions}
          addTransaction={addTransaction}
          fetchTransactions={fetchTransactions}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
      </div>
    </>
  );
};

export default Dashboard;
