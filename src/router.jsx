import { createBrowserRouter, Navigate, useRouteError } from "react-router-dom";
import AppLayout from "./domains/library/AppLayout";
import { Inventory } from "./domains/library/pages/Inventory";
import Metrics from "./domains/library/pages/Metrics";
import Randomize from "./domains/library/pages/Randomize";

// eslint-disable-next-line react-refresh/only-export-components
function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-xl font-bold text-slate-800 mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 mb-4">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/library/inventory"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Go to Inventory
      </a>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function RouteError() {
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
      <a
        href="/library/inventory"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Go to Inventory
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <Navigate to="/library/inventory" replace />,
      },
      {
        path: "/library/inventory",
        element: <Inventory />,
      },
      {
        path: "/library/metrics",
        element: <Metrics />,
      },
      {
        path: "/library/randomize",
        element: <Randomize />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
