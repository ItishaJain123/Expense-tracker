import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const FEATURES = [
  {
    icon: "📊",
    title: "Visual Analytics",
    desc: "Line charts, pie charts, and trend analysis reveal exactly where your money goes every month.",
    color: "from-blue-600/20 to-blue-500/20",
    border: "border-blue-600/20",
  },
  {
    icon: "🗂️",
    title: "Smart Categories",
    desc: "Tag every transaction — Food, Travel, Rent, Salary. Filter and compare spending across categories.",
    color: "from-sky-400/20 to-pink-500/20",
    border: "border-sky-400/20",
  },
  {
    icon: "📅",
    title: "Date Filtering",
    desc: "Analyse any custom time window instantly. Compare this month vs last month in one click.",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
  },
  {
    icon: "📤",
    title: "Import & Export",
    desc: "Bulk-import from Excel, export your full history anytime. Your data is always portable.",
    color: "from-orange-500/20 to-yellow-500/20",
    border: "border-orange-500/20",
  },
  {
    icon: "🔒",
    title: "Secure Auth",
    desc: "Sign in with Google or email/password. Firebase Auth keeps your account protected.",
    color: "from-red-500/20 to-rose-500/20",
    border: "border-red-500/20",
  },
  {
    icon: "☁️",
    title: "Real-time Sync",
    desc: "All data syncs instantly to the cloud. Access your finances from any device, anywhere.",
    color: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/20",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up with email or Google in under 30 seconds. No credit card required.",
  },
  {
    step: "02",
    title: "Add transactions",
    desc: "Log your income and expenses with name, category, amount, and date.",
  },
  {
    step: "03",
    title: "Track & improve",
    desc: "Visualise spending patterns, set goals, and make smarter financial decisions.",
  },
];

// Code-based fake dashboard preview
const AppPreview = () => (
  <div className="w-full max-w-lg bg-[#FFFFFF] rounded-2xl border border-gray-200 shadow-2xl shadow-blue-600/10 overflow-hidden">
    {/* Fake topbar */}
    <div className="flex items-center gap-2 px-4 py-3 bg-[#FFFFFF] border-b border-gray-200">
      <div className="w-3 h-3 rounded-full bg-red-500/60" />
      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
      <div className="w-3 h-3 rounded-full bg-green-500/60" />
      <div className="flex-1 bg-[#F1F5F9] rounded-md h-4 mx-3" />
    </div>

    <div className="flex">
      {/* Fake sidebar */}
      <div className="w-12 bg-[#FFFFFF] border-r border-gray-200 py-4 flex flex-col gap-3 items-center">
        {["🏠", "💳", "📊", "🎯"].map((icon) => (
          <div
            key={icon}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Fake content */}
      <div className="flex-1 p-4 space-y-3">
        {/* Cards row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Balance", value: "₹45,200", c: "border-blue-600/30 bg-blue-600/10", t: "text-blue-700" },
            { label: "Income", value: "₹80,000", c: "border-emerald-500/30 bg-emerald-500/10", t: "text-emerald-700" },
            { label: "Expense", value: "₹34,800", c: "border-red-500/30 bg-red-500/10", t: "text-red-700" },
          ].map(({ label, value, c, t }) => (
            <div key={label} className={`rounded-xl p-2.5 border ${c}`}>
              <p className="text-gray-500 text-[9px] mb-0.5">{label}</p>
              <p className={`font-bold text-xs ${t}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Fake bar chart */}
        <div className="bg-[#F1F5F9] rounded-xl p-3">
          <p className="text-gray-500 text-[9px] mb-2 uppercase tracking-wide">Monthly Trend</p>
          <div className="flex items-end gap-1 h-14">
            {[30, 55, 40, 70, 45, 85, 60, 75, 50, 90, 65, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                <div
                  className="w-full bg-emerald-500/60 rounded-sm"
                  style={{ height: `${h * 0.7}%` }}
                />
                <div
                  className="w-full bg-red-500/60 rounded-sm"
                  style={{ height: `${h * 0.4}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fake transactions */}
        <div className="space-y-1.5">
          {[
            { name: "Salary", cat: "Salary", amt: "+₹50,000", t: "income" },
            { name: "Grocery", cat: "Food & Dining", amt: "-₹3,200", t: "expense" },
            { name: "Netflix", cat: "Entertainment", amt: "-₹649", t: "expense" },
          ].map(({ name, cat, amt, t }) => (
            <div
              key={name}
              className="flex items-center justify-between bg-[#F1F5F9] rounded-lg px-2.5 py-2"
            >
              <div>
                <p className="text-gray-900 text-[10px] font-medium">{name}</p>
                <p className="text-gray-500 text-[8px]">{cat}</p>
              </div>
              <span
                className={`text-[10px] font-bold ${
                  t === "income" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {amt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Landing = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/app/dashboard", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-lg shadow-lg shadow-blue-600/30">
              💰
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
              ExpenseTracker
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-sky-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-600 text-sm font-medium">
                Free personal finance tracker
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
              Take Control of{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-pink-400 bg-clip-text text-transparent">
                Your Money
              </span>
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-lg">
              Track every rupee, understand your spending habits with beautiful
              charts, and make smarter financial decisions — all for free.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-7 py-3.5 rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all hover:scale-[1.02] shadow-xl shadow-blue-600/25 text-base"
              >
                Start Tracking Free →
              </Link>
              <a
                href="#features"
                className="border border-gray-200 text-gray-300 hover:text-gray-900 hover:border-gray-400 font-semibold px-7 py-3.5 rounded-xl transition-all text-base"
              >
                See Features
              </a>
            </div>

            {/* Trust bar */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold text-blue-600">100%</p>
                <p className="text-gray-500 text-xs">Free forever</p>
              </div>
              <div className="w-px h-10 bg-[#F1F5F9]" />
              <div>
                <p className="text-2xl font-bold text-sky-600">Secure</p>
                <p className="text-gray-500 text-xs">Firebase Auth</p>
              </div>
              <div className="w-px h-10 bg-[#F1F5F9]" />
              <div>
                <p className="text-2xl font-bold text-emerald-600">Live</p>
                <p className="text-gray-500 text-xs">Real-time sync</p>
              </div>
            </div>
          </div>

          {/* Right — app preview */}
          <div className="flex justify-center lg:justify-end">
            <AppPreview />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to manage money
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            All the tools a personal finance app needs — clean, fast, and
            completely free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc, color, border }) => (
            <div
              key={title}
              className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Up and running in minutes
          </h2>
          <p className="text-gray-600 text-lg">Three simple steps to financial clarity.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map(({ step, title, desc }, i) => (
            <div key={step} className="relative text-center">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-blue-600/40 to-transparent" />
              )}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto mb-4 shadow-lg shadow-blue-600/30">
                {step}
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-600/20 to-sky-400/20 border border-blue-600/20 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to take control?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
            Join thousands of people already tracking their finances smarter.
            It's free, always.
          </p>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold px-10 py-4 rounded-2xl hover:from-blue-700 hover:to-sky-600 transition-all hover:scale-[1.02] shadow-2xl shadow-blue-600/30 text-lg"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-base shadow-md">
              💰
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
              ExpenseTracker
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Built with React, Firebase &amp; Tailwind CSS
          </p>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Get Started →
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
