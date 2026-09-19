import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import { AppLayout as LibraryAppLayout } from "./domains/library/AppLayout";
import { AppLayout as McuAppLayout } from "./domains/mcu/AppLayout";
import { AppLayout as FinancesAppLayout } from "./domains/finance/AppLayout";
import Home from "./domains/home/pages/Home";
import { Tracker } from "./domains/mcu/pages/Tracker";
import { Inventory } from "./domains/library/pages/Inventory";
import Metrics from "./domains/library/pages/Metrics";
import Randomize from "./domains/library/pages/Randomize";
import { Dashboard as FinancesDashboard } from "./domains/finance/pages/Dashboard";
import { IncomeExpenses } from "./domains/finance/pages/IncomeExpenses";
import { IncomeHistory } from "./domains/finance/pages/IncomeHistory";
import { NotFound } from "./components/NotFound";
import { RouteError } from "./components/RouteError";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "library",
        element: <LibraryAppLayout />,
        children: [
          {
            path: "inventory",
            element: <Inventory />,
          },
          {
            path: "metrics",
            element: <Metrics />,
          },
          {
            path: "randomize",
            element: <Randomize />,
          },
        ],
      },
      {
        path: "finances",
        element: <FinancesAppLayout />,
        children: [
          {
            path: "dashboard",
            element: <FinancesDashboard />,
          },
          {
            path: "income-expenses",
            element: <IncomeExpenses />,
          },
          {
            path: "income-history",
            element: <IncomeHistory />,
          },
        ],
      },
      {
        path: "mcu",
        element: <McuAppLayout />,
        children: [
          {
            path: "tracker",
            element: <Tracker />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
