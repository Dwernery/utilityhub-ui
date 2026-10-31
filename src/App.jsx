import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { McuTrackerProvider } from "./domains/mcu/context/McuTrackerContext.jsx";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <McuTrackerProvider>
            <RouterProvider router={router} />
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: "5px solid red",
                pointerEvents: "none",
                zIndex: 999999,
              }}
            />
          </McuTrackerProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
