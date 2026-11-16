import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./domains/home/pages/Home";
import { NotFound } from "./components/NotFound";
import { RouteError } from "./components/RouteError";

/**
 * Load a route's component on first visit, so each section's code (and the
 * chart library, which only Finances needs) is downloaded only when it's opened.
 * The router waits for the download before switching pages, so the current page
 * stays on screen meanwhile.
 *
 * @param {() => Promise<object>} load  e.g. () => import("./domains/mcu/pages/Tracker")
 * @param {string} name  the module's named export
 */
const lazyComponent = (load, name) => async () => ({
  Component: (await load())[name],
});

export const routes = [
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    // Shown only on a cold start at a section's URL, for the moment its code
    // takes to download. Blank rather than "Loading…", which would just flash.
    hydrateFallbackElement: <div className="min-h-dvh" aria-busy="true" />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "library",
        lazy: lazyComponent(
          () => import("./domains/library/AppLayout"),
          "AppLayout",
        ),
        children: [
          { index: true, element: <Navigate to="inventory" replace /> },
          {
            path: "inventory",
            lazy: lazyComponent(
              () => import("./domains/library/pages/Inventory"),
              "Inventory",
            ),
          },
          {
            path: "metrics",
            lazy: lazyComponent(
              () => import("./domains/library/pages/Metrics"),
              "Metrics",
            ),
          },
          {
            path: "randomize",
            lazy: lazyComponent(
              () => import("./domains/library/pages/Randomize"),
              "Randomize",
            ),
          },
        ],
      },
      {
        path: "finances",
        lazy: lazyComponent(
          () => import("./domains/finance/AppLayout"),
          "AppLayout",
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            path: "dashboard",
            lazy: lazyComponent(
              () => import("./domains/finance/pages/Dashboard"),
              "Dashboard",
            ),
          },
          {
            path: "income-expenses",
            lazy: lazyComponent(
              () => import("./domains/finance/pages/IncomeExpenses"),
              "IncomeExpenses",
            ),
          },
          {
            path: "income-history",
            lazy: lazyComponent(
              () => import("./domains/finance/pages/IncomeHistory"),
              "IncomeHistory",
            ),
          },
        ],
      },
      {
        path: "mcu",
        lazy: lazyComponent(
          () => import("./domains/mcu/AppLayout"),
          "AppLayout",
        ),
        children: [
          { index: true, element: <Navigate to="tracker" replace /> },
          {
            path: "tracker",
            lazy: lazyComponent(
              () => import("./domains/mcu/pages/Tracker"),
              "Tracker",
            ),
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
