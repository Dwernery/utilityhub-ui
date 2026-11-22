import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Modal } from "../../../../components/Modal";
import { useMcuTracker } from "../../context/McuTrackerContext";
import { emptyDraft, KIND_LABELS } from "../../utils/editing";
import { McuItemForm } from "./McuItemForm";

/** "+ Add" menu in the tracker header: Movie, Special or Show Season. */
export function AddContentButton() {
  const { setSelectedId } = useMcuTracker();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adding, setAdding] = useState(null); // "movie" | "special" | "show" | null
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Add
      </button>
      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-1 z-40 w-40 rounded-lg border border-slate-700 bg-slate-800 shadow-xl py-1"
        >
          {["movie", "special", "show"].map((kind) => (
            <button
              key={kind}
              role="menuitem"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setAdding(kind);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              {KIND_LABELS[kind]}
            </button>
          ))}
        </div>
      )}

      {adding && (
        <Modal
          onClose={() => setAdding(null)}
          panelClassName="bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 shadow-2xl"
        >
          <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
            <div className="font-semibold text-slate-100 text-sm">
              Add {KIND_LABELS[adding]}
            </div>
            <button
              onClick={() => setAdding(null)}
              className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
              aria-label="Cancel"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="px-4 py-4">
            <McuItemForm
              key={adding}
              initial={emptyDraft(adding)}
              onCancel={() => setAdding(null)}
              onSaved={(globalId) => {
                setAdding(null);
                // Open the new item, so a new season can get its episodes right away.
                setSelectedId(globalId);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
