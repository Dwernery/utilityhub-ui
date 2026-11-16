import { RotateCw, WifiOff } from "lucide-react";

/**
 * The "couldn't load" state: what failed, why, and a way to retry. Mirrors
 * utility-hub-mobile's components/ui/load-error.tsx.
 *
 * Show it only when there is no data at all (TanStack Query's `isLoadingError`).
 * If a background refetch fails, keep showing the data you already have.
 *
 * @param {string} what  what failed to load, in lowercase: "books", "accounts"
 * @param {Error} [error]
 * @param {() => void} onRetry
 * @param {boolean} [retrying]  a retry is in flight (pass the query's isFetching)
 * @param {boolean} [card]  draw it on a white card (pages); off inside cards, modals and forms
 * @param {boolean} [dark]  for the always-dark MCU pages
 */
export function LoadError({
  what,
  error,
  onRetry,
  retrying = false,
  card = true,
  dark = false,
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-2 text-center ${card ? "py-14 px-4" : "py-4"} ${card && !dark ? "bg-white rounded-xl shadow-sm border border-slate-200" : ""}`}
    >
      <WifiOff
        className={`w-6 h-6 ${dark ? "text-slate-500" : "text-slate-400"}`}
      />
      <p
        className={`text-sm font-semibold ${dark ? "text-slate-200" : "text-slate-700"}`}
      >
        Couldn’t load {what}
      </p>
      {error?.message && (
        <p
          className={`text-xs max-w-md break-words ${dark ? "text-slate-400" : "text-slate-500"}`}
        >
          {error.message}
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        aria-label={`Try loading ${what} again`}
        className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 hover:cursor-pointer disabled:cursor-default ${dark ? "text-blue-300 hover:bg-white/10" : "text-blue-600 hover:bg-blue-50"}`}
      >
        <RotateCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
        {retrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}
