import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "../lib/apiToken";
import { UnlockScreen } from "./UnlockScreen";

/**
 * Shows the app only while an access token is saved; otherwise the unlock screen.
 * A 401 from the API forgets the token (see lib/http.js), which lands back here.
 */
export function TokenGate({ children }) {
  const token = useApiToken();
  const queryClient = useQueryClient();

  // Locked: drop everything fetched with the old token, so none of it is shown
  // again (or left in memory) until someone unlocks.
  useEffect(() => {
    if (!token) queryClient.clear();
  }, [token, queryClient]);

  return token ? children : <UnlockScreen />;
}
