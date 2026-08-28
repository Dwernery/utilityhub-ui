import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ErrorBoundary } from "./ErrorBoundary.jsx";
import { McuTrackerProvider } from "./domains/mcu/context/McuTrackerContext.jsx";

const queryClient = new QueryClient();

function App() {
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

export default App;
