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
    if (user) {
      navigate("/dashboard");
    }
  }, [user, loading]);

  const logoutFnc = () => {
    try {
      signOut(auth)
        .then(() => {
          navigate("/");
          toast.success("Logout Successfully!");
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#9097ac] text-white px-6 py-2 shadow-md flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚀</span>
        <h1 className="text-xl font-bold tracking-wide">Expense Tracker</h1>
      </div>
      {user && (
        <button
          onClick={logoutFnc}
          className="cursor-pointer bg-white text-teal-600 font-semibold px-4 py-2 rounded-md hover:bg-teal-100 transition duration-200 shadow-sm"
        >
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
