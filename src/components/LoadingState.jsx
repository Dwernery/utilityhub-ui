/**
 * The "first fetch in flight" state for a page or panel.
 *
 * @param {string} what  what is loading, in lowercase: "books", "MCU tracker"
 * @param {boolean} [card]  draw it on a white card (pages); off for panels that already have one
 * @param {boolean} [dark]  for the always-dark MCU pages
 */
export function LoadingState({ what, card = true, dark = false }) {
  return (
    <div
      role="status"
      className={`py-14 px-4 text-center ${card && !dark ? "bg-white rounded-xl shadow-sm border border-slate-200" : ""}`}
    >
      <p className="text-sm text-slate-400">Loading {what}…</p>
    </div>
  );
}
