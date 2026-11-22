// Small dark-themed form controls shared by the MCU add/edit forms.

export const inputClass =
  "w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50";

export function Field({ label, htmlFor, children, hint }) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-wide text-slate-400"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function FormButtons({
  onCancel,
  busy,
  saveLabel = "Save",
  busyLabel = "Saving...",
}) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        type="submit"
        disabled={busy}
        className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
      >
        {busy ? busyLabel : saveLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="flex-1 px-3 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-50 text-sm font-semibold cursor-pointer"
      >
        Cancel
      </button>
    </div>
  );
}
