// components/common/FunctionalErrorBoundary.jsx
import { ErrorBoundary } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-8 text-center bg-red-100 text-red-700 rounded">
      <h2 className="text-xl font-bold">Something went wrong.</h2>
      <p className="mt-2">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Try Again
      </button>
    </div>
  );
}

export default function FunctionalErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onReset={() => {
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
