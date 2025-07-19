import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="text-black">Loading...</div>;

  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
