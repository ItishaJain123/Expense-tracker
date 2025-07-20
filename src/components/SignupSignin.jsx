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

  const handleReset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const signupWithEmail = () => {
    setLoading(true);
    if (name && email && password && confirmPassword) {
      if (password === confirmPassword) {
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            toast.success("User Created");
            handleReset();
            setLoading(false);
            createDoc(user, true);
            navigate("/dashboard");
          })
          .catch((error) => {
            if (error.code === "auth/email-already-in-use") {
              toast.error("Email already in use! Redirecting to login...");
              setTimeout(() => setLoginForm(true), 2000);
            } else {
              toast.error(error.message);
              setLoading(false);
            }
          });
      } else {
        toast.error("Passwords do not match!");
        setLoading(false);
      }
    } else {
      toast.error("All fields are required.");
      setLoading(false);
    }
  };

  const signinWithEmail = () => {
    setLoading(true);
    if (email && password) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          toast.success("Signed In!");
          setLoading(false);
          navigate("/dashboard");
        })
        .catch((error) => {
          toast.error(error.message);
          setLoading(false);
        });
    } else {
      toast.error("Please enter both email and password");
      setLoading(false);
    }
  };

  const createDoc = async (user, isSignUp = false) => {
    setLoading(true);
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName ? user.displayName : name,
          email: user.email,
          photoURL: user.photoURL ? user.photoURL : "",
          createdAt: new Date(),
        });
        toast.success("Doc Created!");
        setLoading(false);
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
    } else if (isSignUp) {
      toast.error("The Doc already exists!");
      setLoading(false);
    }
  };

  const googleAuth = () => {
    setLoading(true);
    try {
      signInWithPopup(auth, provider)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;
          createDoc(user, false);
          toast.success("User Authenticated!");
          setLoading(false);
          navigate("/dashboard");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          toast.error(errorMessage);
          setLoading(false);
        });
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center px-4">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
          {loginForm ? "Welcome Back 👋" : "Join Expense Tracker 🎯"}
        </h2>
        <p className="text-center text-sm text-gray-800 dark:text-gray-200">
          {loginForm
            ? "Sign in to manage your finances easily!"
            : "Create your account and start budgeting today."}
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
            placeholder="abc@gmail.com"
            state={email}
            setState={setEmail}
            type="email"
          />
          <Input
            label="Password"
            placeholder="Example@123"
            state={password}
            setState={setPassword}
            type="password"
          />
          {!loginForm && (
            <Input
              label="Confirm Password"
              placeholder="Example@123"
              state={confirmPassword}
              setState={setConfirmPassword}
              type="password"
            />
          )}
        </form>

        <div className="flex flex-col items-center gap-3 pt-2">
          <Button
            text={loginForm ? "Sign In with Email" : "Sign Up with Email"}
            onClick={loginForm ? signinWithEmail : signupWithEmail}
            fullWidth
            disabled={loading}
            loading={loading}
          />
          <div className="text-center text-sm text-gray-800 dark:text-gray-200">
            or
          </div>
          <Button
            text={loginForm ? "Sign in using Google" : "Sign up using Google"}
            onClick={googleAuth}
            blue
            fullWidth
          />
        </div>

        <div className="text-center text-sm text-white mt-4">
          {loginForm ? (
            <>
              <p className="text-center text-sm text-gray-800 dark:text-gray-200">
                Don’t have an account?{" "}
                <button
                  onClick={() => setLoginForm(false)}
                  className="text-blue-600 dark:text-blue-200 font-medium hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-gray-800 dark:text-gray-200">
                Already have an account?{" "}
                <button
                  onClick={() => setLoginForm(true)}
                  className="text-blue-600 dark:text-blue-300 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupSignin;
