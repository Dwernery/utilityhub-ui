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
            <ViewportDebug />
          </McuTrackerProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

function ViewportDebug() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: 10,
        zIndex: 999999,
        background: "black",
        color: "white",
        padding: 15,
        fontSize: 14,
      }}
    >
      <div>Inner width: {window.innerWidth}</div>
      <div>Screen width: {window.screen.width}</div>
      <div>Outer width: {window.outerWidth}</div>
      <div>Standalone: {String(window.navigator.standalone)}</div>
    </div>
  );
}
