import { useMemo, useState } from "react";
import { useMcuTrackerData, useSaveMcuItem, POSTER_TYPES } from "../../hooks";
import { useToast } from "../../../../context/ToastContext";
import {
  domainOptions,
  draftToRequest,
  KIND_LABELS,
} from "../../utils/editing";
import { Field, FormButtons, inputClass } from "./fields";

const NEW_CATEGORY = "__new__";

/**
 * Add or edit a movie, special or show season.
 *
 * @param {object} props
 * @param {object} props.initial  draft from emptyDraft / draftFromRaw / nextSeasonDraft
 * @param {number} [props.id]  numeric id when editing
 * @param {boolean} [props.hasPoster]  editing an item that already has a poster
 * @param {(globalId: string) => void} props.onSaved
 * @param {() => void} props.onCancel
 */
export function McuItemForm({ initial, id, hasPoster, onSaved, onCancel }) {
  const { data } = useMcuTrackerData();
  const options = useMemo(() => domainOptions(data), [data]);
  const save = useSaveMcuItem();
  const addToast = useToast();
  const [draft, setDraft] = useState(initial);
  const [posterFile, setPosterFile] = useState(null);
  // A domain that isn't in the list yet is typed into a text box.
  const [newCategory, setNewCategory] = useState(
    initial.domain && !options.includes(initial.domain),
  );

  const set = (key) => (e) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));
  const isShow = draft.kind === "show";
  const noun = KIND_LABELS[draft.kind];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const checked = draftToRequest(draft);
    if (!checked.ok) {
      addToast(checked.error, "error");
      return;
    }
    try {
      const { globalId, posterError } = await save.mutateAsync({
        kind: isShow ? "show" : "movie",
        id,
        body: checked.body,
        posterFile,
      });
      const what = isShow
        ? `${checked.body.title} season ${checked.body.season}`
        : checked.body.title;
      if (posterError) {
        addToast(
          `${what} saved, but the poster upload failed: ${posterError.message}`,
          "warning",
        );
      } else {
        addToast(`${what} ${id ? "updated" : "added"}`, "success");
      }
      onSaved(globalId);
    } catch (err) {
      addToast(err.message || `Failed to save ${noun.toLowerCase()}`, "error");
    }
  };

  const busy = save.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isShow && (
        <Field label="Type">
          <div className="flex gap-2">
            {["movie", "special"].map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, kind }))}
                disabled={busy}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border cursor-pointer ${
                  draft.kind === kind
                    ? "border-red-500 text-white bg-slate-800"
                    : "border-slate-600 text-slate-400 hover:text-slate-200"
                }`}
              >
                {KIND_LABELS[kind]}
              </button>
            ))}
          </div>
        </Field>
      )}

      <div className={`grid gap-3 ${isShow ? "grid-cols-[1fr_6rem]" : ""}`}>
        <Field label="Title" htmlFor="mcu-title">
          <input
            id="mcu-title"
            value={draft.title}
            onChange={set("title")}
            maxLength={255}
            disabled={busy}
            className={inputClass}
            placeholder={isShow ? "e.g. Loki" : "e.g. Thunderbolts*"}
            autoFocus
          />
        </Field>
        {isShow && (
          <Field label="Season" htmlFor="mcu-season">
            <input
              id="mcu-season"
              inputMode="numeric"
              value={draft.season}
              onChange={set("season")}
              disabled={busy}
              className={inputClass}
            />
          </Field>
        )}
      </div>

      <div className={`grid gap-3 ${isShow ? "" : "grid-cols-2"}`}>
        <Field label="Premiere date" htmlFor="mcu-date">
          <input
            id="mcu-date"
            type="date"
            value={draft.premiereDate}
            onChange={set("premiereDate")}
            disabled={busy}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
        {!isShow && (
          <Field label="Runtime (min)" htmlFor="mcu-runtime">
            <input
              id="mcu-runtime"
              inputMode="numeric"
              value={draft.runtime}
              onChange={set("runtime")}
              disabled={busy}
              className={inputClass}
              placeholder="e.g. 127"
            />
          </Field>
        )}
      </div>

      <Field
        label="Phase or category"
        htmlFor="mcu-domain"
        hint="Phases appear under their saga; anything else is an Expanded Universe category."
      >
        <select
          id="mcu-domain"
          value={newCategory ? NEW_CATEGORY : draft.domain}
          onChange={(e) => {
            if (e.target.value === NEW_CATEGORY) {
              setNewCategory(true);
              setDraft((d) => ({ ...d, domain: "" }));
            } else {
              setNewCategory(false);
              setDraft((d) => ({ ...d, domain: e.target.value }));
            }
          }}
          disabled={busy}
          className={inputClass}
        >
          <option value="" disabled>
            Choose…
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value={NEW_CATEGORY}>New category…</option>
        </select>
        {newCategory && (
          <input
            value={draft.domain}
            onChange={set("domain")}
            maxLength={255}
            disabled={busy}
            className={`${inputClass} mt-2`}
            placeholder="Category name, e.g. Sony Spider-Man Universe"
          />
        )}
      </Field>

      <Field label="Synopsis" htmlFor="mcu-synopsis">
        <textarea
          id="mcu-synopsis"
          value={draft.synopsis}
          onChange={set("synopsis")}
          rows={4}
          disabled={busy}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field
        label="Poster"
        htmlFor="mcu-poster"
        hint={
          hasPoster
            ? "Choosing an image replaces the current poster."
            : "Optional. JPG, PNG, WebP or GIF, up to 10 MB."
        }
      >
        <input
          id="mcu-poster"
          type="file"
          accept={POSTER_TYPES.join(",")}
          onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
          disabled={busy}
          className="block w-full text-sm text-slate-400 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-100 file:text-sm file:font-semibold hover:file:bg-slate-600 file:cursor-pointer"
        />
      </Field>

      <FormButtons
        onCancel={onCancel}
        busy={busy}
        saveLabel={id ? "Save" : `Add ${noun}`}
        busyLabel={posterFile ? "Saving and uploading..." : "Saving..."}
      />
    </form>
  );
}
