/**
 * The tracker's pill toggle: options on a slate-800 box, the selected one raised in slate-700.
 * Shared by the view switch (MCU Phases / Expanded Universe) and the All Titles / Not Finished
 * filter so they always look the same.
 *
 * @param {object} props
 * @param {{ value: string, label: string }[]} props.options
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} props.label  accessible name for the group
 * @param {boolean} [props.stretch]  options split the width equally (like an iOS segmented control)
 * @param {string} [props.className]  layout classes for the box (grid span, etc.)
 * @param {boolean} [props.disabled]  greyed out and not clickable (e.g. the view switch while searching)
 * @param {string} [props.title]  tooltip, e.g. why it's disabled
 */
export function SegmentedToggle({
  options,
  value,
  onChange,
  label,
  stretch = false,
  className = "",
  disabled = false,
  title,
}) {
  return (
    <div
      className={`flex items-center gap-0.5 bg-slate-800 border border-slate-700 rounded-lg p-1 ${className}`}
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      title={title}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={selected}
            className={`${stretch ? "flex-1" : ""} whitespace-nowrap text-xs font-semibold py-1.5 px-3 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              selected
                ? "bg-slate-700 text-slate-50 shadow-sm"
                : "text-slate-400 enabled:hover:text-slate-300 enabled:cursor-pointer"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
