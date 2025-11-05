export default function EmptyState({ message = 'No data found.', icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-center mx-auto">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <p className="text-4xl">{message}</p>
    </div>
  );
}
