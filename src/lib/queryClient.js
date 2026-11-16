import { QueryClient } from "@tanstack/react-query";

// One place for query defaults (mirrors utility-hub-mobile's lib/queryClient.ts):
// data counts as fresh for 30s, then refetches when you come back to the tab,
// so edits made on the phone show up here without a reload.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30_000,
      retry: 1,
    },
  },
});
