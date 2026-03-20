import type { FallbackProps } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message =
    error instanceof Error ? error.message : "Unexpected error occurred";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-3 text-xl font-semibold text-red-600">
          Something went wrong
        </h2>

        <p className="mb-6 text-sm text-gray-700">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={resetErrorBoundary}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
