const Input = ({ label, placeholder, state, setState, type }) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-medium text-gray-800 dark:text-white">
        {label}
      </label>
      <input
        value={state}
        placeholder={placeholder}
        type={type}
        onChange={(e) => setState(e.target.value)}
        className="px-4 py-2 border border-gray-300 dark:border-white/30
                   bg-white text-gray-800 placeholder-gray-500
                   dark:bg-transparent dark:text-white dark:placeholder-white/70
                   rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
      />
    </div>
  );
};

export default Input;
