import { useRouteError } from "react-router-dom";

export function RouteError() {
  const error = useRouteError();
  console.error("Route error:", error);

  return (
    <div className="text-center py-20 px-4">
      <h1 className="text-xl font-bold text-slate-800 mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        {error?.statusText || error?.message || "An unexpected error occurred."}
      </p>
      <a href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
        Go to Home
      </a>
    </div>
  );
}
