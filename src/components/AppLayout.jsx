import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/app/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/app/transactions", icon: "💳", label: "Transactions" },
  { to: "/app/insights", icon: "📊", label: "Insights" },
  { to: "/app/calendar", icon: "📅", label: "Calendar" },
  { to: "/app/budgets", icon: "🎯", label: "Budgets" },
  { to: "/app/goals", icon: "🏆", label: "Goals" },
  { to: "/app/split", icon: "🧾", label: "Split Bills" },
  { to: "/app/accounts", icon: "🏦", label: "Accounts" },
  { to: "/app/settings", icon: "⚙️", label: "Settings" },
];

const SidebarContent = ({ user, onLogout, onNavClick }) => {
  const avatarLetter =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-lg shadow-lg shadow-blue-600/30 flex-shrink-0">
          💰
        </div>
        <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
          ExpenseTracker
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, label, soon }) =>
          soon ? (
            <div
              key={label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 cursor-not-allowed select-none"
            >
              <span className="text-base">{icon}</span>
              <span className="text-sm">{label}</span>
              <span className="ml-auto text-xs bg-[#F1F5F9] text-gray-600 px-1.5 py-0.5 rounded-full">
                Soon
              </span>
            </div>
          ) : (
            <NavLink
              key={label}
              to={to}
              onClick={onNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-700 border border-blue-600/30 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </NavLink>
          )
        )}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-sky-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow">
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 text-sm font-medium truncate">
              {user?.displayName || user?.email?.split("@")[0]}
            </p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-red-500/40 py-2 rounded-xl transition-all duration-200 hover:bg-red-500/10 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

const AppLayout = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const logout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
        toast.success("Logged out!");
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm flex-shrink-0">
        <SidebarContent user={user} onLogout={logout} onNavClick={() => {}} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-2xl">
            <SidebarContent
              user={user}
              onLogout={logout}
              onNavClick={() => setSidebarOpen(false)}
            />
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 transition-colors text-xl cursor-pointer"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-sm">
              💰
            </div>
            <span className="font-bold text-gray-900 text-sm">ExpenseTracker</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
