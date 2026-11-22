import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { checkSession } from "../lib/http";
import { useSessionState } from "../lib/session";
import { LoadError } from "./LoadError";
import { LoadingState } from "./LoadingState";
import { SignInScreen } from "./SignInScreen";

/**
 * Shows the app only while this browser is signed in; otherwise the sign-in screen.
 * On load it asks the API whether the session cookie is still good. A 401 from any
 * request signs out (see lib/http.js), which lands back here.
 */
export function AuthGate({ children }) {
  const state = useSessionState();
  const queryClient = useQueryClient();
  const [checkError, setCheckError] = useState(null);

  // Updates state only once the API has answered (checkSession itself moves the
  // session state on), so it is safe to start from an effect.
  const check = useCallback(
    () =>
      checkSession().then(
        () => setCheckError(null),
        (error) => setCheckError(error),
      ),
    [],
  );

  useEffect(() => {
    if (state === "unknown") check();
  }, [state, check]);

  // Signed out: drop everything fetched in the session, so none of it is shown
  // again (or left in memory) until someone signs in.
  useEffect(() => {
    if (state === "signedOut") queryClient.clear();
  }, [state, queryClient]);

  if (state === "signedIn") return children;
  if (state === "signedOut") return <SignInScreen />;
  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {checkError ? (
          <LoadError
            what="Project SHIELD"
            error={
              checkError instanceof TypeError
                ? new Error("Couldn't reach the server. Check your connection.")
                : checkError
            }
            onRetry={check}
          />
        ) : (
          <LoadingState what="Project SHIELD" />
        )}
      </div>
    </div>
  );
}
