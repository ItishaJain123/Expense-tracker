const Button = ({ text, onClick, blue, fullWidth, disabled, loading, icon }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg
        flex items-center justify-center gap-2 text-sm
        ${fullWidth ? "w-full" : ""}
        ${disabled || loading
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"}
        ${blue
          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/20"
          : "bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:from-blue-700 hover:to-sky-600 shadow-blue-600/20"}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{text}</span>
        </>
      )}
    </button>
  );
};

export default Button;
