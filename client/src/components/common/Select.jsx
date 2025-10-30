import React from 'react';

export default function Select({
  options = [],
  value,
  onChange,
  className = '',
  disabled = false,
  noDefault = false,
  ...rest
}) {
  const defaultClasses =
    'h-10 px-3 py-0 border border-gray-600 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary appearance-none box-border';

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${noDefault ? '' : defaultClasses} ${className}`}
      {...rest}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
