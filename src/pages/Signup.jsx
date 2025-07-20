// import Header from "../components/Header";
// import SignupSignin from "../components/SignupSignin";

// const Signup = () => {
//   return (
//     <div className="min-h-screen">
//       <Header />
//       <main className="flex justify-center items-center">
//         <SignupSignin />
//       </main>
//     </div>
//   );
// };

// export default Signup;

import Header from "../components/Header";
import SignupSignin from "../components/SignupSignin";

const Signup = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      >
        <source src="/Expense-tracker.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay on video (optional) */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Header */}
      <Header />

      {/* Main section */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/40 dark:bg-black/60 backdrop-blur-md rounded-xl p-10 shadow-lg">
          {/* Left Side: Expense Tracker Info */}
          <div className="flex flex-col justify-center text-left text-gray-800 dark:text-gray-100">
            <h2 className="text-3xl font-bold mb-4">Track Every Rupee 💰</h2>
            <p className="text-lg mb-2">
              Our Expense Tracker helps you stay on top of your finances with
              real-time tracking of income, expenses, and balances.
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Visual insights. Simple UI. Full control. Sign up and start saving
              smarter!
            </p>
          </div>

          {/* Right Side: Signup Form */}
          <div className="flex justify-center items-center">
            <SignupSignin />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
