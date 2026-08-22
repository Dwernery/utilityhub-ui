import { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown } from "lucide-react";
export default function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder,
  onAddNew,
  addNewLabel,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase()),
  );

  const showAddNew =
    search.trim() &&
    !options.some((o) => o.toLowerCase() === search.trim().toLowerCase());

  const handleSelect = (val) => {
    onChange(val);
    setSearch("");
    setOpen(false);
  };

  const handleAddNew = () => {
    const t = search.trim();
    if (t) {
      onAddNew(t);
      onChange(t);
      setSearch("");
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div
        className="w-full flex items-center px-4 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => setOpen(true)}
      >
        {open ? (
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 outline-none text-slate-800 bg-transparent text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={`flex-1 text-sm truncate ${value ? "text-slate-800" : "text-slate-400"}`}
          >
            {value || placeholder}
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 && !showAddNew && (
            <div className="px-4 py-3 text-sm text-slate-400">No matches</div>
          )}
          {filtered.map((opt) => (
            <button
              key={opt}
              onMouseDown={() => handleSelect(opt)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-slate-800 transition-colors"
            >
              {opt}
            </button>
          ))}
          {showAddNew && (
            <button
              onMouseDown={handleAddNew}
              className="w-full text-left px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 border-t border-slate-100 transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              {addNewLabel} "{search.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
