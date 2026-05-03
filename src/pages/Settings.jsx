import { useState } from "react";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const Section = ({ title, description, children }) => (
  <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 mb-5">
    <div className="mb-5">
      <h2 className="text-gray-900 font-semibold text-base">{title}</h2>
      {description && <p className="text-gray-600 text-sm mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

const InputField = ({ label, value, onChange, type = "text", placeholder, disabled }) => (
  <div className="mb-4">
    <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-[#F1F5F9] border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);

const Settings = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // Profile
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Delete account
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isGoogleUser = user?.providerData?.some((p) => p.providerId === "google.com");

  const saveProfile = async () => {
    if (!displayName.trim()) { toast.error("Name cannot be empty"); return; }
    setProfileSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message);
    }
    setProfileSaving(false);
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success("Password changed!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        toast.error("Current password is incorrect");
      } else {
        toast.error(err.message);
      }
    }
    setPasswordSaving(false);
  };

  const exportAllData = async () => {
    if (!user) return;
    try {
      toast.info("Preparing export...");
      const txSnap = await getDocs(collection(db, `users/${user.uid}/transactions`));
      const rows = txSnap.docs.map((d) => {
        const data = d.data();
        return {
          Date: data.date,
          Type: data.type,
          Category: data.category || "Other",
          Name: data.name,
          Amount: Number(data.amount),
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, "ExpenseTracker_Export.xlsx");
      toast.success("Data exported!");
    } catch {
      toast.error("Export failed");
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Type "DELETE" to confirm');
      return;
    }
    setDeleting(true);
    try {
      if (isGoogleUser) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(auth.currentUser, provider);
      } else {
        if (!deletePassword) { toast.error("Enter your password to confirm"); setDeleting(false); return; }
        const credential = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }

      // Delete all Firestore subcollections
      const subcollections = ["transactions", "budgets", "goals", "accounts"];
      for (const sub of subcollections) {
        const snap = await getDocs(collection(db, `users/${user.uid}/${sub}`));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, `users/${user.uid}/${sub}`, d.id));
        }
      }

      await deleteUser(auth.currentUser);
      navigate("/");
      toast.success("Account deleted");
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        toast.error("Incorrect password");
      } else {
        toast.error(err.message);
      }
    }
    setDeleting(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 text-sm">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile" description="Update your display name">
        <InputField
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
        <InputField
          label="Email"
          value={user?.email || ""}
          disabled
        />
        <button
          onClick={saveProfile}
          disabled={profileSaving}
          className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all text-sm cursor-pointer disabled:opacity-60"
        >
          {profileSaving ? "Saving..." : "Save Profile"}
        </button>
      </Section>

      {/* Password — only for email/password users */}
      {!isGoogleUser && (
        <Section title="Change Password" description="Use a strong password of at least 6 characters">
          <InputField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
          <InputField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <InputField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            onClick={savePassword}
            disabled={passwordSaving}
            className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all text-sm cursor-pointer disabled:opacity-60"
          >
            {passwordSaving ? "Updating..." : "Change Password"}
          </button>
        </Section>
      )}

      {/* Export */}
      <Section title="Export Data" description="Download all your transactions as an Excel file">
        <button
          onClick={exportAllData}
          className="flex items-center gap-2 bg-[#F1F5F9] border border-gray-200 text-gray-300 hover:text-gray-900 hover:border-gray-500 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
        >
          <span>↓</span> Export All Transactions (.xlsx)
        </button>
      </Section>

      {/* Danger zone */}
      <div className="bg-[#FFFFFF] border border-red-500/20 rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="text-red-600 font-semibold text-base">Danger Zone</h2>
          <p className="text-gray-600 text-sm mt-0.5">
            Permanently delete your account and all data. This cannot be undone.
          </p>
        </div>

        {!isGoogleUser && (
          <InputField
            label="Your Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter your password"
          />
        )}

        <div className="mb-4">
          <label className="text-gray-600 text-xs uppercase tracking-wide mb-2 block">
            Type <span className="text-red-600 font-mono font-bold">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full bg-[#F1F5F9] border border-red-500/30 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <button
          onClick={deleteAccount}
          disabled={deleting || deleteConfirmText !== "DELETE"}
          className="bg-red-500/15 text-red-600 border border-red-500/30 hover:bg-red-500/25 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {deleting ? "Deleting..." : "Delete My Account"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
