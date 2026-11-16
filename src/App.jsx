import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ToastProvider } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TokenGate } from "./components/TokenGate";
import { McuTrackerProvider } from "./domains/mcu/context/McuTrackerContext";

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {/* Everything that talks to the API sits inside the gate. */}
          <TokenGate>
            <McuTrackerProvider>
              <RouterProvider router={router} />
            </McuTrackerProvider>
          </TokenGate>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
