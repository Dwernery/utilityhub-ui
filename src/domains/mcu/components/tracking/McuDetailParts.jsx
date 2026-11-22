// Pieces of the MCU detail modal. Mirrors the sections of utility-hub-mobile's
// app/mcu/item/[globalId].tsx (Hero, Panel, MovieBody, SeasonBody).
import { CircleDashed, Pencil, Plus, Trash2 } from "lucide-react";
import { useMcuTracker } from "../../context/McuTrackerContext";
import { useChangeStatus } from "../../useChangeStatus";
import {
  MODAL_LABELS,
  STATUS_LABELS,
  TYPE_META,
  WATCH_STATUSES,
} from "../../utils/constants";
import { nextEpisodeNumber } from "../../utils/editing";
import { posterBackground } from "../../utils/posterArt";
import { formatRuntime, getStatus, toggleWatched } from "../../utils/stats";
import { EpisodeForm } from "../editing/EpisodeForm";
import { SegmentedToggle } from "../SegmentedToggle";

export const iconButton =
  "p-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50";

const STATUS_OPTIONS = WATCH_STATUSES.map((s) => ({
  value: s,
  label: STATUS_LABELS[s],
}));

/** A labelled block: Progress, Synopsis, Status, Episodes. */
function Panel({ label, action, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
          {label}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Synopsis({ text }) {
  if (!text) return null;
  return (
    <Panel label="Synopsis">
      <p className="text-sm text-slate-300 leading-relaxed p-3 bg-slate-800/50 rounded-lg">
        {text}
      </p>
    </Panel>
  );
}

/** Poster (artwork over generative art), type, title, season/year and runtime. */
export function DetailHero({ item, color }) {
  const Icon = TYPE_META[item.type].icon;
  const runtime =
    item.type === "tv"
      ? item.episodes.reduce((sum, e) => sum + (e.runtime || 0), 0)
      : (item.runtime ?? 0);
  const meta = [
    item.type === "tv" ? `${MODAL_LABELS.SEASON} ${item.seasonNumber}` : null,
    item.premiereDate || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex gap-4 mb-5">
      <div className="relative w-24 h-36 rounded-lg flex-shrink-0 overflow-hidden shadow-md border border-slate-700">
        {/* Generative art, under the artwork */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: posterBackground(item.id, color),
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {item.s3Url && (
          <img
            src={item.s3Url}
            alt={item.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            // Hide a broken image so the art underneath shows.
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start gap-2 mb-2">
          <Icon size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white leading-snug">
              {item.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1 tabular-nums">{meta}</p>
          </div>
        </div>
        {runtime > 0 && (
          <div className="mt-3 p-2 bg-slate-800/50 rounded w-fit">
            <div className="text-xs text-slate-400 mb-1">
              {item.type === "tv" ? "Total Runtime" : "Runtime"}
            </div>
            <div className="text-sm font-semibold text-white tabular-nums">
              {formatRuntime(runtime)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Movie or special: synopsis, then its watch status. */
export function MovieBody({ item }) {
  const { watched } = useMcuTracker();
  const { change, isPending } = useChangeStatus();
  return (
    <>
      <Synopsis text={item.synopsis} />
      <Panel label="Status">
        <SegmentedToggle
          options={STATUS_OPTIONS}
          value={getStatus(watched, item.id)}
          onChange={(status) => change(item.id, status)}
          label="Watch status"
          stretch
          disabled={isPending}
        />
      </Panel>
    </>
  );
}

/**
 * One episode: the checkbox toggles watched; the hover buttons mark In Progress (or clear it),
 * edit or delete. So a stray click can't reset a finished episode.
 */
function EpisodeRow({
  episode,
  color,
  status,
  busy,
  onChange,
  onEdit,
  onDelete,
  deleting,
}) {
  const watched = status === "WATCHED";
  const inProgress = status === "IN_PROGRESS";
  const toggleLabel = watched
    ? MODAL_LABELS.MARK_UNWATCHED
    : MODAL_LABELS.MARK_WATCHED;
  const progressLabel = inProgress ? "Clear in progress" : "Mark in progress";

  return (
    <div className="group flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 transition-colors">
      <button
        onClick={() => onChange(toggleWatched(status))}
        disabled={busy}
        aria-label={`Episode ${episode.episodeNumber}: ${toggleLabel}`}
        title={toggleLabel}
        style={{
          backgroundColor: watched
            ? color
            : inProgress
              ? `${color}33`
              : "transparent",
          borderColor: watched || inProgress ? color : "#475569",
        }}
        className="flex-shrink-0 w-5 h-5 rounded border-2 transition-all disabled:opacity-50 hover:cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium ${watched ? "text-slate-400" : "text-white"}`}
        >
          <span className="text-slate-500 mr-2 tabular-nums">
            {episode.episodeNumber}.
          </span>
          {episode.title}
          {episode.runtime ? (
            <span className="text-slate-500 ml-2">• {episode.runtime} min</span>
          ) : null}
        </div>
      </div>
      <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={() => onChange(inProgress ? "UNWATCHED" : "IN_PROGRESS")}
          disabled={busy}
          className={`${iconButton} hover:bg-slate-700`}
          title={progressLabel}
          aria-label={`Episode ${episode.episodeNumber}: ${progressLabel}`}
          aria-pressed={inProgress}
        >
          <CircleDashed
            className="w-3.5 h-3.5"
            style={{ color: inProgress ? color : "#cbd5e1" }}
          />
        </button>
        <button
          onClick={onEdit}
          className={`${iconButton} hover:bg-slate-700`}
          title="Edit episode"
          aria-label={`Edit episode ${episode.episodeNumber}`}
        >
          <Pencil className="w-3.5 h-3.5 text-slate-300" />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className={`${iconButton} hover:bg-rose-950`}
          title="Delete episode"
          aria-label={`Delete episode ${episode.episodeNumber}`}
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
        </button>
      </div>
    </div>
  );
}

/**
 * A season: progress, synopsis, then its episodes, edited inline.
 * `editing` is the id of the episode being edited, "new" while adding one, or null.
 */
export function SeasonBody({
  item,
  color,
  editing,
  onEditing,
  onDeleteEpisode,
  deleting,
}) {
  const { watched } = useMcuTracker();
  const { change, isPending } = useChangeStatus();
  const { episodes } = item;
  const watchedCount = episodes.filter(
    (e) => getStatus(watched, e.globalId) === "WATCHED",
  ).length;

  return (
    <>
      {episodes.length > 0 && (
        <Panel
          label="Progress"
          action={
            <div className="text-xs text-slate-300 font-medium tabular-nums">
              {watchedCount}/{episodes.length} watched
            </div>
          }
        >
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${(watchedCount / episodes.length) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </Panel>
      )}

      <Synopsis text={item.synopsis} />

      <Panel
        label="Episodes"
        action={
          <button
            onClick={() => onEditing("new")}
            disabled={editing === "new"}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <Plus size={14} />
            Add episode
          </button>
        }
      >
        {editing === "new" && (
          <div className="mb-2">
            <EpisodeForm
              showId={item.recordId}
              nextNumber={nextEpisodeNumber(episodes)}
              onDone={() => onEditing(null)}
            />
          </div>
        )}
        {episodes.length === 0 && editing !== "new" && (
          <p className="text-sm text-slate-500 italic">
            No episodes yet. Add them one at a time.
          </p>
        )}
        <div className="space-y-1.5">
          {episodes.map((episode) =>
            editing === episode.id ? (
              <EpisodeForm
                key={episode.globalId}
                showId={item.recordId}
                episode={episode}
                nextNumber={episode.episodeNumber}
                onDone={() => onEditing(null)}
              />
            ) : (
              <EpisodeRow
                key={episode.globalId}
                episode={episode}
                color={color}
                status={getStatus(watched, episode.globalId)}
                busy={isPending}
                onChange={(status) =>
                  change(episode.globalId, status, { episode: true })
                }
                onEdit={() => onEditing(episode.id)}
                onDelete={() => onDeleteEpisode(episode)}
                deleting={deleting}
              />
            ),
          )}
        </div>
      </Panel>
    </>
  );
}
