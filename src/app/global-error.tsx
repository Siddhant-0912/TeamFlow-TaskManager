"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-white text-black flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-gray-500">
            An unexpected error occurred.
          </p>

          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}