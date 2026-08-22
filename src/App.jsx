import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./context/ToastContext.jsx";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
