import { useState } from "react";

const Input = ({ label, placeholder, state, setState, type, showToggle }) => {
  const [visible, setVisible] = useState(false);

  const inputType = type === "password" && showToggle
    ? (visible ? "text" : "password")
    : type;

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-medium text-gray-800">
        {label}
      </label>
      <div className="relative">
        <input
          value={state}
          placeholder={placeholder}
          type={inputType}
          onChange={(e) => setState(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-800 placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm pr-10"
        />
        {type === "password" && showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-base leading-none"
            tabIndex={-1}
          >
            {visible ? "🙈" : "👁️"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
