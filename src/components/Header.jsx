import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";

const Header = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, loading]);

  const logout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
        toast.success("Logged out successfully!");
      })
      .catch((err) => toast.error(err.message));
  };

  const avatarLetter =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-lg shadow-lg shadow-blue-600/30">
          💰
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
          ExpenseTracker
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-sky-400 flex items-center justify-center text-gray-900 text-sm font-bold shadow">
              {avatarLetter}
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">
              {user.displayName || user.email?.split("@")[0]}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-red-500/50 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-red-500/10 cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
