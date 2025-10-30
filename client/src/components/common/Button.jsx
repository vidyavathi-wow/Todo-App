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
  const defaultClasses =
    'mt-6 w-40 h-10 bg-primary text-white rounded text-sm hover:bg-primary/80 transition';

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
