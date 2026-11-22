import { useState } from "react";
import { Eye, EyeOff, Fingerprint, KeyRound } from "lucide-react";
import { login } from "../lib/http";
import {
  isCancelled,
  passkeysSupported,
  signInWithPasskey,
} from "../lib/passkey";
import { describeThisDevice } from "../lib/session";

/** Message for a failed sign-in; fetch throws a TypeError when the server can't be reached. */
const describeError = (error) =>
  error instanceof TypeError
    ? "Couldn't reach the server. Check your connection and try again."
    : error.message;

/**
 * Sign-in: Touch ID (a passkey) when this browser can do it, with the password as the
 * fallback. Either way the API answers with the session cookie and the app appears.
 */
export function SignInScreen() {
  const canUsePasskey = passkeysSupported();
  const [mode, setMode] = useState(canUsePasskey ? "passkey" : "password");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handlePasskey = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithPasskey(); // the app replaces this screen
      return;
    } catch (err) {
      if (err.status === 404) {
        // No passkey registered yet (or passkeys are off): the password it is.
        setMode("password");
        setError(err.message);
      } else if (!isCancelled(err)) {
        setError(describeError(err));
      }
    }
    setBusy(false);
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(password, describeThisDevice()); // the app replaces this screen
      return;
    } catch (err) {
      setError(describeError(err));
    }
    setBusy(false);
  };

  const errorMessage = error && (
    <p id="sign-in-error" role="alert" className="mt-3 text-xs text-red-600">
      {error}
    </p>
  );

  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <img src="/logo.png" alt="" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
              Project SHIELD
            </h1>
            <p className="text-xs text-slate-500">Sign in to continue</p>
          </div>
        </div>

        {mode === "passkey" ? (
          <>
            <button
              type="button"
              onClick={handlePasskey}
              disabled={busy}
              autoFocus
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:cursor-pointer disabled:cursor-default"
            >
              <Fingerprint className="w-4 h-4" />
              {busy ? "Waiting for Touch ID…" : "Sign in with Touch ID"}
            </button>
            {errorMessage}
            <button
              type="button"
              onClick={() => {
                setMode("password");
                setError(null);
              }}
              className="mt-4 w-full text-xs font-semibold text-slate-500 hover:text-slate-700 hover:cursor-pointer"
            >
              Use password instead
            </button>
          </>
        ) : (
          <form onSubmit={handlePassword}>
            {/* Lets password managers file the password under a recognisable name. */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              value="Project SHIELD"
              readOnly
              hidden
            />

            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                autoFocus
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "sign-in-error" : undefined}
                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:cursor-pointer"
              >
                {visible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errorMessage}

            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:cursor-pointer disabled:cursor-default"
            >
              <KeyRound className="w-4 h-4" />
              {busy ? "Signing in…" : "Sign in"}
            </button>
            {canUsePasskey && (
              <button
                type="button"
                onClick={() => {
                  setMode("passkey");
                  setError(null);
                }}
                className="mt-4 w-full text-xs font-semibold text-slate-500 hover:text-slate-700 hover:cursor-pointer"
              >
                Use Touch ID instead
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
