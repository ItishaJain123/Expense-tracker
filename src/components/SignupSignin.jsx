import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, provider } from "../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SignupSignin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState(false);
  const navigate = useNavigate();

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const createDoc = async (user, isSignUp = false) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || name,
          email: user.email,
          photoURL: user.photoURL || "",
          createdAt: new Date(),
        });
      } catch (err) {
        toast.error(err.message);
      }
    } else if (isSignUp) {
      toast.error("Account already exists!");
    }
  };

  const signupWithEmail = () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        toast.success("Account created!");
        reset();
        setLoading(false);
        createDoc(cred.user, true);
        navigate("/app/dashboard");
      })
      .catch((err) => {
        if (err.code === "auth/email-already-in-use") {
          toast.error("Email already in use. Please sign in.");
          setLoading(false); // Bug fix: was missing in this branch
          setTimeout(() => setLoginForm(true), 1500);
        } else {
          toast.error(err.message);
          setLoading(false);
        }
      });
  };

  const signinWithEmail = () => {
    setLoading(true);
    if (!email || !password) {
      toast.error("Please enter email and password.");
      setLoading(false);
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast.success("Signed in!");
        setLoading(false);
        navigate("/app/dashboard");
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  };

  const googleAuth = () => {
    setLoading(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        createDoc(result.user, false);
        toast.success("Signed in with Google!");
        setLoading(false);
        navigate("/app/dashboard");
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {loginForm ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {loginForm
              ? "Sign in to your account"
              : "Start tracking your finances today"}
          </p>
        </div>

        <form className="space-y-1" onSubmit={(e) => e.preventDefault()}>
          {!loginForm && (
            <Input
              label="Full Name"
              placeholder="John Doe"
              state={name}
              setState={setName}
              type="text"
            />
          )}
          <Input
            label="Email"
            placeholder="you@example.com"
            state={email}
            setState={setEmail}
            type="email"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            state={password}
            setState={setPassword}
            type="password"
          />
          {!loginForm && (
            <Input
              label="Confirm Password"
              placeholder="••••••••"
              state={confirmPassword}
              setState={setConfirmPassword}
              type="password"
            />
          )}
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            text={loginForm ? "Sign In" : "Create Account"}
            onClick={loginForm ? signinWithEmail : signupWithEmail}
            fullWidth
            loading={loading}
            disabled={loading}
          />
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-gray-500 text-xs">or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>
          <Button
            text="Continue with Google"
            onClick={googleAuth}
            fullWidth
            blue
            disabled={loading}
          />
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          {loginForm ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setLoginForm(!loginForm)}
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
          >
            {loginForm ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupSignin;
