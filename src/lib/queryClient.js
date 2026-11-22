import { QueryClient } from "@tanstack/react-query";
import { UnauthorizedError } from "./http";

// One place for query defaults (mirrors utility-hub-mobile's lib/queryClient.ts):
// data counts as fresh for 30s, then refetches when you come back to the tab,
// so edits made on the phone show up here without a reload.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30_000,
      // One retry for blips, but never for a rejected session: it would just be
      // rejected again.
      retry: (failureCount, error) =>
        !(error instanceof UnauthorizedError) && failureCount < 1,
    },
  },
});
