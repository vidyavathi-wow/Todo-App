import React from "react";

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder = "",
  className = "",
  onKeyDown,
  disabled = false,
  noDefault = false,
  ...rest
}) => {
  const defaultClasses =
    "w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      disabled={disabled}
      className={`${noDefault ? "" : defaultClasses} ${className}`}
      {...rest}
    />
  );
};

export default Input;
