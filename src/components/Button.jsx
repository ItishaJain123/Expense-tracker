const Button = ({ text, onClick, blue, fullWidth, disabled, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${
          blue
            ? "bg-teal-600 text-white hover:bg-teal-500 hover:scale-[1.02]"
            : "bg-white text-teal-600 border border-teal-600 hover:bg-teal-50 hover:scale-[1.02]"
        }
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : (
        text
      )}
    </button>
  );
};

export default Button;
