import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ToastProvider } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { McuTrackerProvider } from "./domains/mcu/context/McuTrackerContext";

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <McuTrackerProvider>
            <RouterProvider router={router} />
          </McuTrackerProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
