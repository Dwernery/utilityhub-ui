import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { setApiToken } from "../lib/apiToken";
import { checkApiToken } from "../lib/http";

/**
 * Asks for the access token (the API_TOKEN set on the server). It is checked
 * against the API before being saved, so a typo gets a clear message.
 */
export function UnlockScreen() {
  const [token, setToken] = useState("");
  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const candidate = token.trim();
    if (!candidate) {
      setError("Enter your access token.");
      return;
    }

    setChecking(true);
    setError(null);
    try {
      if ((await checkApiToken(candidate)) === "valid") {
        setApiToken(candidate); // the app replaces this screen
        return;
      }
      setError("That token isn't right. Check it and try again.");
    } catch (err) {
      // fetch throws a TypeError when the server can't be reached at all.
      setError(
        err instanceof TypeError
          ? "Couldn't reach the server. Check your connection and try again."
          : err.message,
      );
    }
    setChecking(false);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <img src="/logo.png" alt="" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
              Project SHIELD
            </h1>
            <p className="text-xs text-slate-500">Enter your access token</p>
          </div>
        </div>

        {/* Lets password managers file the token under a recognisable name. */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          value="Project SHIELD"
          readOnly
          hidden
        />

        <label
          htmlFor="api-token"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Access token
        </label>
        <div className="relative">
          <input
            id="api-token"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            spellCheck={false}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={checking}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "api-token-error" : "api-token-help"}
            className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide token" : "Show token"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:cursor-pointer"
          >
            {visible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {error ? (
          <p
            id="api-token-error"
            role="alert"
            className="mt-2 text-xs text-red-600"
          >
            {error}
          </p>
        ) : (
          <p id="api-token-help" className="mt-2 text-xs text-slate-500">
            It&apos;s the API_TOKEN from the server&apos;s .env. It&apos;s
            remembered in this browser only.
          </p>
        )}

        <button
          type="submit"
          disabled={checking}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:cursor-pointer disabled:cursor-default"
        >
          <KeyRound className="w-4 h-4" />
          {checking ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
