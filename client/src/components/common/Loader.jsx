export default function Loader({ size = 16, text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 mx-auto">
      <div
        className="animate-spin rounded-full border-4 border-t-4 border-gray-300 border-t-primary h-16 w-16"
        style={{ width: size, height: size }}
      ></div>
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  );
}
