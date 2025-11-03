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
      className={`p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-primary outline-none w-full ${className}`}
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
