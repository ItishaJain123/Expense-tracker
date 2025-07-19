const Input = ({ label, placeholder, state, setState, type }) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-medium text-white">{label}</label>
      <input
        value={state}
        placeholder={placeholder}
        type={type}
        onChange={(e) => setState(e.target.value)}
        className="px-4 py-2 border border-white/30 bg-transparent text-white placeholder-white/70 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
      />
    </div>
  );
};

export default Input;
