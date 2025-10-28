import React from "react";

const Select = ({ label, value, onChange, options = [], className }) => {
  return (
    <div className="flex flex-col w-52">
      {label && <p className="mt-4 text-gray-light">{label}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 px-3 py-2 border border-gray-700 rounded bg-gray-light text-gray-dark focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
      >
        {options.map((opt, index) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const label = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={index} value={val} className="text-gray-dark">
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Select;
