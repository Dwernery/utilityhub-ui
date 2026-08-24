import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./domains/library/AppLayout";
import { Inventory } from "./domains/library/pages/Inventory";
import Metrics from "./domains/library/pages/Metrics";
import Randomize from "./domains/library/pages/Randomize";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
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
    ],
  },
]);
