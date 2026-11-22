import { useState } from "react";
import { useSaveEpisode } from "../../hooks";
import { useToast } from "../../../../context/ToastContext";
import { episodeToRequest } from "../../utils/editing";
import { FormButtons, inputClass } from "./fields";

/**
 * Inline add/edit form for one episode, shown inside the season's detail modal.
 * @param {{ showId: number, episode?: { id: number, episodeNumber: number, title: string, runtime: number },
 *   nextNumber: number, onDone: () => void }} props
 */
export function EpisodeForm({ showId, episode, nextNumber, onDone }) {
  const save = useSaveEpisode();
  const addToast = useToast();
  const [form, setForm] = useState({
    episodeNumber: String(episode?.episodeNumber ?? nextNumber),
    title: episode?.title ?? "",
    runtime: episode?.runtime != null ? String(episode.runtime) : "",
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const checked = episodeToRequest(form);
    if (!checked.ok) {
      addToast(checked.error, "error");
      return;
    }
    try {
      await save.mutateAsync({
        showId,
        episodeId: episode?.id,
        body: checked.body,
      });
      addToast(
        `Episode ${checked.body.episodeNumber} ${episode ? "updated" : "added"}`,
        "success",
      );
      onDone();
    } catch (err) {
      addToast(err.message || "Failed to save episode", "error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 rounded-lg bg-slate-800/70 border border-slate-600 space-y-2"
    >
      <div className="grid grid-cols-[4rem_1fr_5.5rem] gap-2">
        <input
          aria-label="Episode number"
          inputMode="numeric"
          value={form.episodeNumber}
          onChange={set("episodeNumber")}
          disabled={save.isPending}
          className={inputClass}
          placeholder="#"
        />
        <input
          aria-label="Episode title"
          value={form.title}
          onChange={set("title")}
          maxLength={255}
          disabled={save.isPending}
          className={inputClass}
          placeholder="Episode title"
          autoFocus
        />
        <input
          aria-label="Runtime in minutes"
          inputMode="numeric"
          value={form.runtime}
          onChange={set("runtime")}
          disabled={save.isPending}
          className={inputClass}
          placeholder="min"
        />
      </div>
      <FormButtons
        onCancel={onDone}
        busy={save.isPending}
        saveLabel={episode ? "Save episode" : "Add episode"}
      />
    </form>
  );
}
