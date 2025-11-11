export default function Select({
  name,
  value,
  onChange,
  options,
  className = '',
  noDefault,
  ...rest
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`p-3 rounded w-full outline-none transition-colors duration-300
        bg-gray-800 text-gray-200 border border-gray-600
        focus:ring-2 focus:ring-primary
        dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300
        ${className}`}
      {...rest}
    >
      {!noDefault && <option value="">Select an option</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
