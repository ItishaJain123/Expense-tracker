import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import SignupSignin from "../components/SignupSignin";

const Signup = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  // Redirect already-logged-in users away from login page
  useEffect(() => {
    if (!loading && user) navigate("/app/dashboard");
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-700/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-3xl shadow-xl shadow-blue-600/30">
            💰
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
            ExpenseTracker
          </span>
        </Link>

        <SignupSignin />

        <Link
          to="/"
          className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
};

export default Signup;
