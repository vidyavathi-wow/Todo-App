import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  noDefault = false,
  ...rest
}) => {
  const defaultClasses = `
    mt-6 w-40 h-10 rounded text-sm font-medium transition-colors duration-300
    bg-primary text-white hover:bg-primary/80
    disabled:opacity-50 disabled:cursor-not-allowed
    dark:text-white dark:hover:bg-primary/70
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${noDefault ? '' : defaultClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
