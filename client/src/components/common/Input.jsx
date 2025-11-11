import React from 'react';

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
  onKeyDown,
  disabled = false,
  noDefault = false,
  ...rest
}) => {
  const defaultClasses = `
    w-full px-4 py-2 border rounded transition-colors duration-300
    bg-gray-900 text-gray-200 border-gray-600
    focus:outline-none focus:ring-2 focus:ring-primary
    dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300
  `;

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      disabled={disabled}
      className={`${noDefault ? '' : defaultClasses} ${className}`}
      {...rest}
    />
  );
};

export default Input;
